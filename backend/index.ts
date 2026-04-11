import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import { randomBytes, createHash } from 'crypto';
import * as cheerio from 'cheerio';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_SECRET";
let mailTransporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_HOST) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
}

// ============================================
// Security Utilities
// ============================================

/**
 * Validate URL format and protocol
 * Prevents javascript:, data:, and other dangerous URIs
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    // Basic length check to prevent DOS
    if (urlString.length > 2048) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if IP is in private range (SSRF protection)
 * Blocks: 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, ::1, fc00::/7
 */
function isPrivateIp(ip: string): boolean {
  const privateRanges = [
    /^127\./,           // 127.0.0.0/8 (loopback)
    /^10\./,            // 10.0.0.0/8 (private)
    /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12 (private)
    /^192\.168\./,      // 192.168.0.0/16 (private)
    /^::1$/,            // IPv6 loopback
    /^fc00:/,           // IPv6 private
    /^localhost$/i,     // localhost hostname
  ];
  return privateRanges.some(range => range.test(ip));
}

/**
 * Safe IP extraction from request
 * Validates and extracts client IP from headers only in trusted proxy setup
 */
function extractClientIp(req: express.Request): string {
  let ip = req.socket.remoteAddress || '';
  
  // Only trust x-forwarded-for if explicitly enabled (behind trusted proxy)
  if (process.env.TRUST_PROXY === 'true') {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      ip = forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded)) {
      ip = forwarded[0].trim();
    }
  }
  
  // Clean up IPv6 address format
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  return ip;
}

function isValidEmail(email: string): boolean {
  const normalized = email?.trim().toLowerCase();
  return /^([\w-.]+)@([\w-]+\.)+([\w-]{2,})$/.test(normalized);
}

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = (req.headers.authorization || "").toString();
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Validate tag input to prevent injection
 */
function isValidTag(tag: string): boolean {
  if (!tag || typeof tag !== 'string') return false;
  // Alphanumeric, spaces, hyphens, underscores only - max 50 chars
  return /^[a-zA-Z0-9\s\-_]{1,50}$/.test(tag.trim());
}

const dbPath = path.join(process.cwd(), 'database', 'live.db');
const db = new Database(dbPath);

// Abuse Protection (Rate Limiting)
const createLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 links per hour
  message: { error: 'You have exceeded the maximum number of links you can create per hour. Please try again later to prevent spam.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// SECURITY FIX: Add rate limiting for redirects to prevent click flooding
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 redirects per minute
  skip: (req) => {
    // Don't count if it's a invalid short URL (404)
    return req.params.short_url?.startsWith('api') || req.params.short_url?.startsWith('node_modules');
  },
  standardHeaders: false,
  legacyHeaders: false,
});


// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    original_url TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    tag TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL,
    name TEXT NOT NULL,
    short_url TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clicks (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    device TEXT,
    country TEXT,
    city TEXT,
    referrer TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS link_tags (
    id TEXT PRIMARY KEY,
    link_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE,
    UNIQUE(link_id, tag)
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration for user_id column
try {
  db.exec(`ALTER TABLE links ADD COLUMN user_id TEXT`);
} catch (e) {}

// Migration for tag column if it doesn't exist
try {
  db.exec(`ALTER TABLE links ADD COLUMN tag TEXT`);
} catch (e) {}

// Migration for visitor tracking
try {
  db.exec(`ALTER TABLE clicks ADD COLUMN visitor_id TEXT`);
} catch (e) {}



/**
 * Analytics Service
 * Handles complex SQL operations for link tracking
 */
const AnalyticsService = {
  getLinkStats: (linkId: string, timeframe: string = '30d') => {
    // Generate precise UTC ISO timestamp in JS to avoid SQLite 'now' ambiguity
    const now = new Date();
    const timeframeMs: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '60d': 60 * 24 * 60 * 60 * 1000
    };
    
    const cutoffDate = new Date(now.getTime() - (timeframeMs[timeframe] || timeframeMs['30d']));
    const cutoff = cutoffDate.toISOString().replace('T', ' ').split('.')[0];
    
    console.log(`[Analytics] Stats for link ${linkId} | Timeframe: ${timeframe} | Cutoff: ${cutoff}`);

    const totalVisits = db.prepare(`
      SELECT COUNT(*) as count FROM clicks 
      JOIN channels ON clicks.channel_id = channels.id 
      WHERE channels.link_id = ? AND clicks.timestamp >= ?
    `).get(linkId, cutoff) as { count: number };

    const uniqueVisits = db.prepare(`
      SELECT COUNT(DISTINCT visitor_id) as count FROM clicks 
      JOIN channels ON clicks.channel_id = channels.id 
      WHERE channels.link_id = ? AND clicks.timestamp >= ? AND visitor_id IS NOT NULL
    `).get(linkId, cutoff) as { count: number };


    const byChannel = db.prepare(`
      SELECT channels.name, COUNT(clicks.id) as count 
      FROM channels 
      LEFT JOIN clicks ON channels.id = clicks.channel_id AND clicks.timestamp >= ?
      WHERE channels.link_id = ? 
      GROUP BY channels.id
    `).all(cutoff, linkId);

    const byDevice = db.prepare(`
      SELECT device, COUNT(*) as count 
      FROM clicks 
      JOIN channels ON clicks.channel_id = channels.id 
      WHERE channels.link_id = ? AND device IS NOT NULL AND clicks.timestamp >= ?
      GROUP BY device
    `).all(linkId, cutoff);

    const byReferrer = db.prepare(`
      SELECT referrer, COUNT(*) as count 
      FROM clicks 
      JOIN channels ON clicks.channel_id = channels.id 
      WHERE channels.link_id = ? AND referrer IS NOT NULL AND clicks.timestamp >= ?
      GROUP BY referrer
    `).all(linkId, cutoff);

    const byCity = db.prepare(`
      SELECT city, COUNT(*) as count 
      FROM clicks 
      JOIN channels ON clicks.channel_id = channels.id 
      WHERE channels.link_id = ? AND city IS NOT NULL AND clicks.timestamp >= ?
      GROUP BY city
    `).all(linkId, cutoff);

    const byCountry = db.prepare(`
      SELECT country, COUNT(*) as count 
      FROM clicks 
      JOIN channels ON clicks.channel_id = channels.id 
      WHERE channels.link_id = ? AND country IS NOT NULL AND clicks.timestamp >= ?
      GROUP BY country
    `).all(linkId, cutoff);

    const timeline = db.prepare(`
      SELECT 
        ${timeframe === '24h' ? "strftime('%H:00', timestamp)" : "date(timestamp)"} as date, 
        COUNT(*) as count
      FROM clicks
      JOIN channels ON clicks.channel_id = channels.id
      WHERE channels.link_id = ? AND clicks.timestamp >= ?
      GROUP BY date
      ORDER BY MIN(clicks.timestamp) ASC
    `).all(linkId, cutoff);

    return {
      totalVisits: totalVisits.count,
      uniqueVisits: uniqueVisits.count,
      clicksByChannel: byChannel,
      clicksByDevice: byDevice,
      clicksByReferrer: byReferrer,
      clicksByCity: byCity,
      clicksByCountry: byCountry,
      timeline
    };
  },

  getGlobalSummary: () => {
    const totalVisits = db.prepare('SELECT COUNT(*) as count FROM clicks').get() as { count: number };
    const totalLinks = db.prepare('SELECT COUNT(*) as count FROM links').get() as { count: number };
    return { 
      totalVisits: totalVisits.count, 
      totalLinks: totalLinks.count 
    };
  }
};

async function startServer() {
  console.log(">>> [Server] Initializing LinkEngine...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // SECURITY FIX: Add CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Link Management
  app.post('/api/links', createLinkLimiter, (req, res) => {
    const { original_url, title } = req.body;
    if (!original_url) return res.status(400).json({ error: 'URL required' });
    
    // SECURITY FIX: Validate URL format and protocol
    if (!isValidUrl(original_url)) {
      return res.status(400).json({ error: 'Invalid URL. Only http:// and https:// are allowed.' });
    }

    const id = randomBytes(8).toString('hex');
    const slug = randomBytes(3).toString('hex');
    
    try {
      db.prepare('INSERT INTO links (id, original_url, slug, title) VALUES (?, ?, ?, ?)').run(id, original_url, slug, title || null);
      // Create Direct channel (for direct link shares)
      db.prepare('INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(randomBytes(8).toString('hex'), id, 'Direct', slug);
      // Create QR channel (for QR code tracking)
      const qrUrl = `${slug}-qr`;
      db.prepare('INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(randomBytes(8).toString('hex'), id, 'QR', qrUrl);
      res.json({ id, original_url, slug, title });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/request-otp", async (req: any, res: any) => {
    try {
      const email = (req.body.email || "").toString().trim().toLowerCase();
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
      const userId = existingUser?.id || randomBytes(8).toString("hex");

      if (!existingUser) {
        db.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, email);
      }

      db.prepare("INSERT INTO otp_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)").run(randomBytes(8).toString("hex"), email, code, expiresAt);

      const subject = "Your live.fyi OTP code";
      const text = `Your one-time login code is: ${code}. It expires in 15 minutes.`;

      if (mailTransporter) {
        await mailTransporter.sendMail({
          from: process.env.SMTP_FROM || "noreply@live.fyi",
          to: email,
          subject,
          text,
        });
      } else {
        console.log(`[OTP] ${email}: ${code}`);
      }

      return res.json({ success: true, message: "OTP sent to email" });
    } catch (error: any) {
      console.error("POST /api/auth/request-otp error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req: any, res: any) => {
    try {
      const email = (req.body.email || "").toString().trim().toLowerCase();
      const code = (req.body.code || "").toString().trim();

      if (!email || !code || !isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const otpRecord = db.prepare("SELECT id, expires_at FROM otp_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1").get(email, code) as any;

      if (!otpRecord) {
        return res.status(400).json({ error: "Invalid code" });
      }

      if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ error: "OTP expired" });
      }

      db.prepare("DELETE FROM otp_codes WHERE id = ?").run(otpRecord.id);

      const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        return res.status(400).json({ error: "No user found" });
      }

      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "30d" });
      return res.json({ success: true, token, email });
    } catch (error: any) {
      console.error("POST /api/auth/verify-otp error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: any, res: any) => {
    try {
      const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(req.user.userId) as any;
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/links', authMiddleware, (req: any, res: any) => {
    const userId = req.user.userId;
    const links = db.prepare('SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    const linksWithTags = links.map(link => {
      const tags = db.prepare('SELECT tag FROM link_tags WHERE link_id = ?').all(link.id) as { tag: string }[];
      return { ...link, tags: tags.map(t => t.tag) };
    });
    res.json(linksWithTags);
  });

  app.post('/api/links', (req: any, res: any) => {
    try {
      let userId: string | null = null;
      const authHeader = (req.headers.authorization || "").toString();
      if (authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const payload = jwt.verify(token, JWT_SECRET) as any;
          userId = payload.userId;
        } catch (err) {}
      }

      const { original_url, slug: slugInput, title } = req.body;
      if (!original_url) return res.status(400).json({ error: 'URL required' });
      
      // SECURITY FIX: Validate URL format and protocol
      if (!isValidUrl(original_url)) {
        return res.status(400).json({ error: 'Invalid URL. Only http:// and https:// are allowed.' });
      }

      const id = randomBytes(8).toString('hex');
      const slug = slugInput || randomBytes(3).toString('hex');
      
      db.prepare('INSERT INTO links (id, user_id, original_url, slug, title) VALUES (?, ?, ?, ?, ?)').run(id, userId, original_url, slug, title || null);
      // Create Direct channel
      db.prepare('INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(randomBytes(8).toString('hex'), id, 'Direct', slug);
      // Create QR channel
      const qrUrl = `${slug}-qr`;
      db.prepare('INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(randomBytes(8).toString('hex'), id, 'QR', qrUrl);
      
      res.json({ id, original_url, slug, title });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/links/:id/tags', (req, res) => {
    const { tag } = req.body;
    if (!tag) return res.status(400).json({ error: 'Tag required' });
    
    // SECURITY FIX: Validate tag input to prevent injection
    if (!isValidTag(tag)) {
      return res.status(400).json({ error: 'Invalid tag. Use only letters, numbers, spaces, hyphens, underscores (max 50 chars).' });
    }
    
    try {
      const id = randomBytes(8).toString('hex');
      db.prepare('INSERT OR IGNORE INTO link_tags (id, link_id, tag) VALUES (?, ?, ?)').run(id, req.params.id, tag.trim());
      res.json({ success: true, tag: tag.trim() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/links/:id/tags/:tag', (req, res) => {
    const { tag } = req.params;
    try {
      db.prepare('DELETE FROM link_tags WHERE link_id = ? AND tag = ?').run(req.params.id, tag);
      res.json({ success: true, tag });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/links/:id', (req, res) => {
    const link = db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id) as any;
    if (!link) return res.status(404).json({ error: 'Not found' });
    const channels = db.prepare('SELECT * FROM channels WHERE link_id = ?').all(req.params.id);
    const tags = db.prepare('SELECT tag FROM link_tags WHERE link_id = ?').all(link.id) as { tag: string }[];
    res.json({ ...link, channels, tags: tags.map(t => t.tag) });
  });

  app.post('/api/links/:id/channels', (req, res) => {
    const { name } = req.body;
    const link = db.prepare('SELECT slug FROM links WHERE id = ?').get(req.params.id) as any;
    if (!link) return res.status(404).json({ error: 'Not found' });

    const short_url = `${link.slug}-${randomBytes(2).toString('hex')}`;
    db.prepare('INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(randomBytes(8).toString('hex'), req.params.id, name, short_url);
    res.json({ success: true, short_url });
  });

  app.delete('/api/links/:id/channels/:channelId', (req, res) => {
    try {
      const channel = db.prepare('SELECT name FROM channels WHERE id = ?').get(req.params.channelId) as any;
      if (channel?.name === 'Direct') {
        return res.status(400).json({ error: 'Cannot delete the Direct channel' });
      }
      db.prepare('DELETE FROM channels WHERE id = ? AND link_id = ?').run(req.params.channelId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Endpoints
  app.get('/api/links/:id/analytics', (req, res) => {
    const { timeframe } = req.query;
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    console.log('Fetching stats for link:', req.params.id, 'with timeframe:', timeframe);
    const stats = AnalyticsService.getLinkStats(req.params.id, timeframe as string);
    res.json(stats);
  });

  app.get('/api/analytics/global', (req, res) => {
    res.json(AnalyticsService.getGlobalSummary());
  });

  // SEO Analyzer
  app.post('/api/seo-analyze', async (req, res) => {
    const { url } = req.body;
    
    // SECURITY FIX: Validate URL format
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    try {
      // SECURITY FIX: Block SSRF - prevent fetching private IPs
      const urlObj = new URL(url);
      if (isPrivateIp(urlObj.hostname)) {
        return res.status(403).json({ error: 'Cannot analyze private network URLs' });
      }
      
      // Add timeout and size limits to fetch
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'live.fyi-analyzer/1.0' },
        redirect: 'follow',
        size: 1024 * 1024, // 1MB limit
      });
      clearTimeout(timeout);
      
      const html = await response.text();
      const $ = cheerio.load(html);

      const basicMeta = {
        title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
        description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
      };

      // AI suggestions not available
      res.json({ ...basicMeta, aiSuggestions: null });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timeout' });
      }
      console.error('SEO analysis error:', error.message);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });

  app.delete('/api/links/:id', (req, res) => {
    db.prepare('DELETE FROM links WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Redirect Logic
  app.get('/:short_url', redirectLimiter, (req, res, next) => {
    const { short_url } = req.params;
    if (['api', 'src', '@', 'node_modules'].some(p => short_url.startsWith(p))) return next();

    const channel = db.prepare('SELECT * FROM channels WHERE short_url = ?').get(short_url) as any;
    if (channel) {
      const link = db.prepare('SELECT original_url FROM links WHERE id = ?').get(channel.link_id) as any;
      if (link) {
        const rawUa = req.headers['user-agent'] || '';
        const parser = new UAParser(rawUa);
        
        // SECURITY FIX: Safe IP extraction with validation
        let clientIp = extractClientIp(req);
        
        // SECURITY FIX: Remove dev IP fallback - only use actual client IP
        // In production, if IP is empty, use a placeholder that won't pollute analytics
        if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1') {
          clientIp = 'unknown';
        }
        
        let geo: any = null;
        let country = 'Unknown';
        let city = 'Unknown';
        
        // Only perform geolocation lookup if IP is valid and not private
        if (clientIp !== 'unknown' && !isPrivateIp(clientIp)) {
          geo = geoip.lookup(clientIp);
          country = geo ? geo.country : 'Unknown';
          city = geo ? geo.city || 'Unknown' : 'Unknown';
        }
        
        // 1. Generate unique Visitor ID (Tracking)
        // Use rawUa if available, otherwise just hash IP
        const visitor_id = clientIp !== 'unknown' 
          ? createHash('sha256').update(`${clientIp}-${rawUa}`).digest('hex').substring(0, 16)
          : createHash('sha256').update(rawUa || randomBytes(16).toString('hex')).digest('hex').substring(0, 16);
        
        // 2. Normalize Device Type
        const rawDevice = parser.getDevice().type || 'desktop';
        const deviceMap: Record<string, string> = { 'mobile': 'Phone', 'tablet': 'Tablet', 'desktop': 'Desktop' };
        const deviceType = deviceMap[rawDevice] || 'Other';

        // 3. Normalize Referrer
        const rawReferrer = req.headers.referer || '';
        let cleanReferrer = 'Direct';
        if (rawReferrer) {
          try {
            const hostname = new URL(rawReferrer).hostname.toLowerCase();
            if (hostname.includes('t.co') || hostname.includes('twitter')) cleanReferrer = 'Twitter';
            else if (hostname.includes('google')) cleanReferrer = 'Google';
            else if (hostname.includes('facebook') || hostname.includes('fb.com')) cleanReferrer = 'Facebook';
            else if (hostname.includes('instagram')) cleanReferrer = 'Instagram';
            else if (hostname.includes('linkedin')) cleanReferrer = 'LinkedIn';
            else if (hostname.includes('youtube')) cleanReferrer = 'YouTube';
            else cleanReferrer = hostname.replace('www.', '');
          } catch (e) { cleanReferrer = 'Direct'; }
        }

        db.prepare('INSERT INTO clicks (id, channel_id, device, country, city, referrer, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          randomBytes(8).toString('hex'), 
          channel.id, 
          deviceType, 
          country, 
          city,
          cleanReferrer,
          visitor_id
        );
        return res.redirect(link.original_url);
      }
    }
    next();
  });

  // Server Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`live.fyi engine active on port ${PORT}`);
    
    // Background Database Bloat Preventer
    // Runs every hour to clean up raw click rows older than 90 days 
    // (since our max analytics window is 60d, we don't need raw rows older than this)
    setInterval(() => {
      try {
        const result = db.prepare("DELETE FROM clicks WHERE timestamp < datetime('now', '-90 days')").run();
        console.log(`[Cron] Database pruned. Removed ${result.changes} old click records to prevent bloat.`);
      } catch (e) {
        console.error('[Cron] Cleanup failed:', e);
      }
    }, 60 * 60 * 1000);
  });
}

startServer().catch(e => {
  console.error(">>> [FATAL] LinkEngine boot failed:", e);
  process.exit(1);
});
