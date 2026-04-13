import express from "express";
import cors from "cors";
import { randomBytes, createHash } from "crypto";
import * as cheerio from "cheerio";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createDatabase, initializeSchema, createDatabaseWrapper } from "../lib/db.js";

dotenv.config();

const db = createDatabase(process.env);
const database = createDatabaseWrapper(db);

// Initialize schema asynchronously
initializeSchema(db).catch(console.error);

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_SECRET";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "noreply@live.fyi";
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");
console.log("[BOOT] APP_URL resolved to:", JSON.stringify(APP_URL));
console.log("[BOOT] APP_URL env raw:", JSON.stringify(process.env.APP_URL));

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

console.log("[INIT] Email service: Resend", { apiKeyConfigured: Boolean(RESEND_API_KEY), from: RESEND_FROM });

async function sendEmail({ from, to, subject, text }: { from: string; to: string; subject: string; text: string }) {
  console.log("[OTP] sendEmail called via Resend", { to, from, subject });
  
  if (!RESEND_API_KEY) {
    console.error("[OTP] Resend API key not configured");
    return null;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: text.replace(/\n/g, "<br/>"),
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("[OTP] Resend send failed", { status: response.status, error: result });
      throw new Error(`Resend failed ${response.status}: ${JSON.stringify(result)}`);
    }

    console.log("[OTP] Email sent successfully via Resend", { to, messageId: result.id });
    return { provider: "resend", status: 200, messageId: result.id };
  } catch (error: any) {
    console.error("[OTP] Email send failed", error);
    throw error;
  }
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRUST_PROXY = process.env.TRUST_PROXY !== "false";

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Initialize database schema
await initializeSchema(db);

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (urlString.length > 2048) return false;
    return true;
  } catch {
    return false;
  }
}

function isPrivateIp(ip: string): boolean {
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^::1$/,
    /^fc00:/,
    /^localhost$/i,
  ];
  return privateRanges.some((range) => range.test(ip));
}

function extractClientIp(req: any): string {
  if (TRUST_PROXY) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const ips = typeof forwarded === "string" ? forwarded.split(",") : forwarded;
      return (ips[0] || "").trim();
    }
  }
  return req.socket?.remoteAddress || "unknown";
}

function isValidTag(tag: string): boolean {
  const maxLen = 50;
  const validChars = /^[a-zA-Z0-9\s\-_]+$/;
  return tag.length > 0 && tag.length <= maxLen && validChars.test(tag);
}

function isValidEmail(email: string): boolean {
  const normalized = email?.trim().toLowerCase();
  return /^([\w-.]+)@([\w-]+\.)+([\w-]{2,})$/.test(normalized);
}

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = (req.headers.authorization || "").toString();
  console.log("[AUTH] Full request headers:", Object.keys(req.headers));
  console.log("[AUTH] Authorization header raw:", authHeader || "MISSING");
  console.log("[AUTH] Authorization header length:", authHeader.length);
  console.log("[AUTH] JWT_SECRET is set:", !!process.env.JWT_SECRET);
  
  if (!authHeader.startsWith("Bearer ")) {
    console.log("[AUTH] Failed: Missing or invalid Bearer token");
    console.log("[AUTH] Header starts with:", authHeader.substring(0, 50));
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];
  console.log("[AUTH] Token present:", !!token, "Length:", token?.length);
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log("[AUTH] Token verified successfully. UserID:", payload.userId);
    req.user = payload;
    next();
  } catch (err: any) {
    console.log("[AUTH] Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: (req: any) => {
    const path = req.params.short_url || "";
    // Skip static assets and system routes
    return /^(api|node_modules|favicon|manifest|assets|js|css|img|images|static)\./.test(path) ||
           /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(path);
  },
  standardHeaders: false,
  legacyHeaders: false,
});

// Database schema is initialized by initializeSchema() in lib/db.ts

// ============================================
// Analytics Service
// ============================================

const AnalyticsService = {
  getLinkStats: async (linkId: string, timeframe: string = "30d") => {
    try {
      const now = new Date();
      const timeframeMs: Record<string, number> = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "60d": 60 * 24 * 60 * 60 * 1000,
      };

      const cutoffDate = new Date(
        now.getTime() - (timeframeMs[timeframe] || timeframeMs["30d"])
      );
      const cutoff = cutoffDate
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

      const totalVisits = await database
        .prepare(
          `
        SELECT COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
      `
        )
        .get(linkId, cutoff) as { count: number };

      const uniqueVisits = await database
        .prepare(
          `
        SELECT COUNT(DISTINCT visitor_id) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ? AND visitor_id IS NOT NULL
      `
        )
        .get(linkId, cutoff) as { count: number };

      const clicksByChannel = await database
        .prepare(
          `
        SELECT channels.name, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
        GROUP BY channels.id
      `
        )
        .all(linkId, cutoff) as Array<{ name: string; count: number }>;

      const clicksByDevice = await database
        .prepare(
          `
        SELECT device, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
        GROUP BY device
      `
        )
        .all(linkId, cutoff) as Array<{ device: string; count: number }>;

      const clicksByReferrer = await database
        .prepare(
          `
        SELECT referrer, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `
        )
        .all(linkId, cutoff) as Array<{ referrer: string; count: number }>;

      const clicksByCity = await database
        .prepare(
          `
        SELECT city, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
        GROUP BY city
        ORDER BY count DESC
        LIMIT 20
      `
        )
        .all(linkId, cutoff) as Array<{ city: string; count: number }>;

      const clicksByCountry = await database
        .prepare(
          `
        SELECT country, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
        GROUP BY country
        ORDER BY count DESC
      `
        )
        .all(linkId, cutoff) as Array<{ country: string; count: number }>;

      const timeline = await database
        .prepare(
          `
        SELECT DATE(clicks.timestamp) as date, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        WHERE channels.link_id = ? AND clicks.timestamp >= ?
        GROUP BY DATE(clicks.timestamp)
        ORDER BY date ASC
      `
        )
        .all(linkId, cutoff) as Array<{ date: string; count: number }>;

      return {
        totalVisits: totalVisits?.count || 0,
        uniqueVisits: uniqueVisits?.count || 0,
        clicksByChannel: clicksByChannel || [],
        clicksByDevice: clicksByDevice || [],
        clicksByReferrer: clicksByReferrer || [],
        clicksByCity: clicksByCity || [],
        clicksByCountry: clicksByCountry || [],
        timeline: timeline || [],
      };
    } catch (error) {
      console.error("Analytics error:", error);
      return {
        totalVisits: 0,
        uniqueVisits: 0,
        clicksByChannel: [],
        clicksByDevice: [],
        clicksByReferrer: [],
        clicksByCity: [],
        clicksByCountry: [],
        timeline: [],
      };
    }
  },

  getGlobalSummary: async () => {
    try {
      const all = await database
        .prepare(`SELECT COUNT(*) as count FROM clicks`)
        .get() as { count: number };

      const unique = await database
        .prepare(
          `SELECT COUNT(DISTINCT visitor_id) as count FROM clicks WHERE visitor_id IS NOT NULL`
        )
        .get() as { count: number };

      const topLinks = await database
        .prepare(
          `
        SELECT links.id, links.slug, COUNT(*) as count FROM clicks 
        JOIN channels ON clicks.channel_id = channels.id 
        JOIN links ON channels.link_id = links.id 
        GROUP BY links.id
        ORDER BY count DESC
        LIMIT 10
      `
        )
        .all() as Array<{ id: string; slug: string; count: number }>;

      return {
        totalClicks: all?.count || 0,
        uniqueVisitors: unique?.count || 0,
        topLinks: topLinks || [],
      };
    } catch (error) {
      console.error("Global analytics error:", error);
      return { totalClicks: 0, uniqueVisitors: 0, topLinks: [] };
    }
  },
};

// ============================================
// API Routes
// ============================================

app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/auth/request-otp", async (req: any, res: any) => {
  try {
    const email = (req.body.email || "").toString().trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Upsert user
    const existingUser = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const userId = existingUser?.id || randomBytes(8).toString("hex");

    if (!existingUser) {
      await database.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, email);
    }

    await database
      .prepare("INSERT INTO otp_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)")
      .run(randomBytes(8).toString("hex"), email, code, expiresAt);

    const subject = "Your live.fyi OTP code";
    const text = `Your one-time login code is: ${code}. It expires in 15 minutes.`;
    let sentInfo: any = null;

    try {
      sentInfo = await sendEmail({
        from: RESEND_FROM,
        to: email,
        subject,
        text,
      });
    } catch (mailError) {
      console.error("[OTP] Email send failed:", mailError);
      sentInfo = null;
    }

    if (sentInfo) {
      console.log("[OTP] Email sent successfully", {
        to: email,
        provider: sentInfo.provider || "resend",
        messageId: sentInfo.messageId,
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

    const otpRecord = await database
      .prepare("SELECT id, expires_at FROM otp_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1")
      .get(email, code);

    if (!otpRecord) {
      console.log("[OTP] No OTP record found for email:", email);
      return res.status(400).json({ error: "Invalid code" });
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      console.log("[OTP] OTP expired for email:", email);
      return res.status(400).json({ error: "OTP expired" });
    }

    // Delete used OTP
    await database.prepare("DELETE FROM otp_codes WHERE id = ?").run(otpRecord.id);

    const user = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (!user) {
      console.log("[OTP] No user found after OTP verification for email:", email);
      return res.status(400).json({ error: "No user found" });
    }

    console.log("[OTP] Creating token for user:", user.id, "Email:", email);
    console.log("[OTP] JWT_SECRET is set:", !!process.env.JWT_SECRET, "Using default:", !process.env.JWT_SECRET);
    
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "30d" });
    console.log("[OTP] Token created successfully");
    return res.json({ success: true, token, email });
  } catch (error: any) {
    console.error("POST /api/auth/verify-otp error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/google", (req: any, res: any) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log("[GOOGLE] Redirecting to Google OAuth");
  res.redirect(googleAuthUrl);
});

app.get("/api/auth/google/callback", async (req: any, res: any) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error("[GOOGLE] OAuth error:", error);
      return res.redirect(`${APP_URL}/auth?error=${encodeURIComponent(error as string)}`);
    }
    
    if (!code) {
      console.error("[GOOGLE] No authorization code received");
      return res.redirect(`${APP_URL}/auth?error=no_code`);
    }
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("[GOOGLE] Google OAuth credentials not configured");
      return res.redirect(`${APP_URL}/auth?error=not_configured`);
    }
    
    console.log("[GOOGLE] Exchanging auth code for token...");
    
    // Exchange auth code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("[GOOGLE] Token exchange failed:", error);
      return res.redirect(`${APP_URL}/auth?error=token_exchange_failed`);
    }
    
    const { id_token } = await tokenResponse.json();
    console.log("[GOOGLE] ID token received, verifying...");
    
    // Verify and decode the ID token (simple JWT decode without verification for now)
    // In production, you should verify the signature
    const parts = id_token.split(".");
    if (parts.length !== 3) {
      console.error("[GOOGLE] Invalid ID token format");
      return res.redirect(`${APP_URL}/auth?error=invalid_token`);
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const { email, sub: googleId, picture, name } = payload;
    
    console.log("[GOOGLE] Token decoded. Email:", email);
    
    if (!email || !isValidEmail(email)) {
      console.error("[GOOGLE] Invalid or missing email in token");
      return res.redirect(`${APP_URL}/auth?error=invalid_email`);
    }
    
    // Upsert user
    const existingUser = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const userId = existingUser?.id || randomBytes(8).toString("hex");
    
    if (!existingUser) {
      await database
        .prepare("INSERT INTO users (id, email) VALUES (?, ?)")
        .run(userId, email);
      console.log("[GOOGLE] New user created:", userId, "Email:", email);
    } else {
      console.log("[GOOGLE] Existing user found:", userId, "Email:", email);
    }
    
    // Create JWT token
    const appToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "30d" });
    console.log("[GOOGLE] App JWT created successfully");
    
    // Redirect to dashboard with token and email as URL params
    console.log("[GOOGLE] APP_URL at redirect time:", JSON.stringify(APP_URL));
    if (!APP_URL) {
      console.error("[GOOGLE] CRITICAL: APP_URL is empty! Set APP_URL=https://live.fyi in Railway dashboard!");
    }
    const redirectUrl = `${APP_URL}/auth-callback?token=${encodeURIComponent(appToken)}&email=${encodeURIComponent(email)}`;
    console.log("[GOOGLE] Final redirectUrl:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("GET /api/auth/google/callback error:", error);
    res.redirect(`${APP_URL}/auth?error=${encodeURIComponent(error.message)}`);
  }
});

app.get("/api/auth/me", authMiddleware, async (req: any, res: any) => {
  try {
    const user = await database.prepare("SELECT id, email FROM users WHERE id = ?").get(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/links", async (req: any, res: any) => {
  try {
    // Authentication is OPTIONAL - allow both guest and authenticated users
    console.log("[POST /api/links] Headers received:", Object.keys(req.headers));
    console.log("[POST /api/links] Authorization:", req.headers.authorization ? "Present" : "Missing (guest)");
    
    let userId: string | null = null;
    
    // Check for optional authentication
    const authHeader = (req.headers.authorization || "").toString();
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
        console.log("[POST /api/links] Authenticated user:", userId);
      } catch (err) {
        console.log("[POST /api/links] Token verification failed, proceeding as guest");
        // Continue as guest - don't fail on invalid token
      }
    }
    
    const { original_url, slug: slugInput, title } = req.body;
    console.log("[POST /api/links] Creating link - UserID:", userId || "GUEST", "URL:", original_url);

    if (!isValidUrl(original_url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const id = randomBytes(8).toString("hex");
    const slug = slugInput || randomBytes(4).toString("hex");

    await database.prepare(
      "INSERT INTO links (id, user_id, original_url, slug, title) VALUES (?, ?, ?, ?, ?)"
    ).run(id, userId, original_url, slug, title || null);

    console.log("[POST /api/links] Link inserted - ID:", id, "Slug:", slug, "UserID:", userId || "GUEST");

    // Create Direct channel (for direct link shares)
    const directChannelId = randomBytes(8).toString("hex");
    try {
      await database.prepare(
        "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
      ).run(directChannelId, id, "Direct", slug);
      console.log("[POST /api/links] Direct channel created - ID:", directChannelId, "Short URL:", slug);
    } catch (dbErr) {
      console.error("[POST /api/links] ERROR creating Direct channel:", dbErr);
      throw dbErr;
    }
    
    // Create QR channel (for QR code tracking)
    const qrUrl = `${slug}-qr`;
    const qrChannelId = randomBytes(8).toString("hex");
    try {
      await database.prepare(
        "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
      ).run(qrChannelId, id, "QR", qrUrl);
      console.log("[POST /api/links] QR channel created - ID:", qrChannelId, "Short URL:", qrUrl);
    } catch (dbErr) {
      console.error("[POST /api/links] ERROR creating QR channel:", dbErr);
      throw dbErr;
    }

    console.log("[POST /api/links] Returning response - ID:", id, "Slug:", slug);

    res.json({ id, slug, original_url });
  } catch (error: any) {
    console.error("POST /api/links error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/links", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.userId; // Get authenticated user ID
    const links = await database
      .prepare(
        "SELECT id, original_url, slug, title FROM links WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId) as Array<{
      id: string;
      original_url: string;
      slug: string;
      title: string | null;
    }>;

    // Fetch tags for each link separately
    const linksWithTags = await Promise.all(
      links.map(async (link) => {
        const tags = await database
          .prepare("SELECT tag FROM link_tags WHERE link_id = ?")
          .all(link.id) as Array<{ tag: string }>;
        return {
          ...link,
          tags: tags.map((t) => t.tag),
        };
      })
    );

    res.json(linksWithTags);
  } catch (error: any) {
    console.error("GET /api/links error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/links/:id", async (req: any, res: any) => {
  try {
    const link = await database
      .prepare(
        `
      SELECT id, original_url, slug, title, user_id
      FROM links
      WHERE id = ?
    `
      )
      .get(req.params.id) as any;

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Allow access if:
    // 1. Link is a guest link (user_id is NULL)
    // 2. User is authenticated AND owns the link
    // 3. User is NOT authenticated but link is a guest link
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {
        // Token invalid - check if guest link
      }
    }

    // If link has an owner (user_id is set), only owner can view details
    if (link.user_id && link.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch tags and channels separately
    const tagsResult = await database
      .prepare(`SELECT tag FROM link_tags WHERE link_id = ?`)
      .all(req.params.id) as Array<{ tag: string }>;

    const channelsResult = await database
      .prepare(`SELECT id, name, short_url FROM channels WHERE link_id = ?`)
      .all(req.params.id) as Array<{ id: string; name: string; short_url: string }>;

    res.json({
      ...link,
      tags: tagsResult.map(t => t.tag),
      channels: channelsResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/links/:id/tags", async (req: any, res: any) => {
  try {
    const { tag } = req.body;

    if (!isValidTag(tag)) {
      return res
        .status(400)
        .json({
          error: "Invalid tag (max 50 chars, alphanumeric + spaces/hyphens)",
        });
    }

    const link = await database.prepare("SELECT user_id FROM links WHERE id = ?").get(req.params.id) as any;
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Allow if:
    // 1. Link is a guest link (user_id is NULL)
    // 2. User is authenticated and owns the link
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {}
    }

    if (link.user_id && link.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await database.prepare(
      "INSERT OR IGNORE INTO link_tags (id, link_id, tag) VALUES (?, ?, ?)"
    ).run(randomBytes(8).toString("hex"), req.params.id, tag);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/links/:id/tags/:tag", async (req: any, res: any) => {
  try {
    const link = await database.prepare("SELECT user_id FROM links WHERE id = ?").get(req.params.id) as any;
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Allow if:
    // 1. Link is a guest link (user_id is NULL)
    // 2. User is authenticated and owns the link
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {}
    }

    if (link.user_id && link.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await database.prepare("DELETE FROM link_tags WHERE link_id = ? AND tag = ?").run(
      req.params.id,
      req.params.tag
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/links/:id/channels", async (req: any, res: any) => {
  try {
    const { name } = req.body;
    const linkData = await database.prepare("SELECT slug, user_id FROM links WHERE id = ?").get(req.params.id) as any;
    if (!linkData) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Allow if:
    // 1. Link is a guest link (user_id is NULL)
    // 2. User is authenticated and owns the link
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {}
    }

    if (linkData.user_id && linkData.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const short_url = `${linkData.slug}-${randomBytes(2).toString("hex")}`;
    await database.prepare(
      "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
    ).run(randomBytes(8).toString("hex"), req.params.id, name, short_url);
    res.json({ success: true, short_url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/links/:id/channels/:channelId", async (req: any, res: any) => {
  try {
    const link = await database.prepare("SELECT user_id FROM links WHERE id = ?").get(req.params.id) as any;
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Allow if:
    // 1. Link is a guest link (user_id is NULL)
    // 2. User is authenticated and owns the link
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {}
    }

    if (link.user_id && link.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const channel = await database
      .prepare("SELECT name FROM channels WHERE id = ?")
      .get(req.params.channelId) as any;
    if (channel?.name === "Direct") {
      return res.status(400).json({ error: "Cannot delete Direct channel" });
    }
    await database.prepare("DELETE FROM channels WHERE id = ? AND link_id = ?").run(
      req.params.channelId,
      req.params.id
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/links/:id/analytics", async (req: any, res: any) => {
  try {
    const link = await database.prepare("SELECT user_id FROM links WHERE id = ?").get(req.params.id) as any;
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Allow access if:
    // 1. Link is a guest link (user_id is NULL)
    // 2. User is authenticated AND owns the link
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {
        // Token invalid
      }
    }

    // If link has an owner, only owner can view analytics
    if (link.user_id && link.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { timeframe } = req.query;
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const stats = await AnalyticsService.getLinkStats(
      req.params.id,
      timeframe as string
    );
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/global", authMiddleware, async (req: any, res: any) => {
  try {
    const summary = await AnalyticsService.getGlobalSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/seo-analyze", async (req: any, res: any) => {
  const { url } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    const urlObj = new URL(url);
    if (isPrivateIp(urlObj.hostname)) {
      return res.status(403).json({ error: "Cannot analyze private URLs" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // Increased timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try YouTube-specific metadata first
    let image = $('meta[property="og:image"]').attr("content") || 
                $('meta[name="twitter:image"]').attr("content") ||
                $('meta[property="twitter:image"]').attr("content") ||
                "";
    
    // For YouTube short URLs, try to extract video ID and construct thumbnail
    if (!image && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      try {
        let videoId = "";
        if (url.includes("youtube.com/watch")) {
          videoId = new URL(url).searchParams.get("v") || "";
        } else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1].split("?")[0];
        }
        if (videoId) {
          image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } catch (e) {
        // Video ID extraction failed, continue with empty image
      }
    }

    const basicMeta = {
      title:
        $("title").text() ||
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        "",
      description:
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        "",
      image: image,
    };

    res.json({ ...basicMeta, aiSuggestions: null });
  } catch (error: any) {
    console.error("SEO analyze error:", error);
    res.status(500).json({ error: "Analysis failed", details: error.message });
  }
});

app.delete("/api/links/:id", async (req: any, res: any) => {
  try {
    const link = await database.prepare("SELECT user_id FROM links WHERE id = ?").get(req.params.id) as any;
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Get user ID from token if authenticated
    const authHeader = (req.headers.authorization || "").toString();
    let userId: string | null = null;
    
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.userId;
      } catch (err) {}
    }

    // If link has no owner (guest link), cannot delete
    if (!link.user_id) {
      return res.status(403).json({ error: "Cannot delete guest links" });
    }

    // If link has owner, user must be authenticated and own the link
    if (link.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Cascade delete through channels -> clicks -> then link_tags and finally link
    await database.prepare("DELETE FROM clicks WHERE channel_id IN (SELECT id FROM channels WHERE link_id = ?)").run(req.params.id);
    await database.prepare("DELETE FROM channels WHERE link_id = ?").run(req.params.id);
    await database.prepare("DELETE FROM link_tags WHERE link_id = ?").run(req.params.id);
    await database.prepare("DELETE FROM links WHERE id = ?").run(req.params.id);

    res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/links/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Redirect handler
app.get("/:short_url", redirectLimiter, async (req: any, res: any, next: any) => {
  try {
    const { short_url } = req.params;
    if (["api", "src", "@", "node_modules", "dashboard", "login", "auth-callback", "links"].some((p) => short_url.startsWith(p)))
      return next();

    console.log(`[REDIRECT] Looking up short_url: '${short_url}'`);
    const channel = await database
      .prepare("SELECT id, link_id, name FROM channels WHERE short_url = ?")
      .get(short_url) as any;
    
    console.log(`[REDIRECT] Query result:`, channel ? "FOUND" : "NOT FOUND");
    if (channel) {
      console.log(`[REDIRECT] Channel found - ID: ${channel.id}, Link ID: ${channel.link_id}, Name: ${channel.name}`);
    } else {
      console.log(`[REDIRECT] No channel found for short_url: '${short_url}'. Checking database...`);
      // Debug: List all channels to see what's in the database
      const allChannels = await database.prepare("SELECT short_url, link_id, name FROM channels LIMIT 10").all() as any[];
      console.log(`[REDIRECT] First 10 channels in DB:`, allChannels.map(c => `${c.short_url} -> link ${c.link_id}`).join(', '));
    }

    if (channel) {
      const link = await database
        .prepare("SELECT original_url FROM links WHERE id = ?")
        .get(channel.link_id) as any;

      if (link && link.original_url) {
        const rawUa = req.headers["user-agent"] || "";
        const parser = new UAParser(rawUa);
        let clientIp = extractClientIp(req);

        if (
          !clientIp ||
          clientIp === "::1" ||
          clientIp === "127.0.0.1"
        ) {
          clientIp = "unknown";
        }

        let country = "Unknown",
          city = "Unknown";

        if (clientIp !== "unknown" && !isPrivateIp(clientIp)) {
          // Use geoip-lite for country (fast, no API call)
          const geo = geoip.lookup(clientIp);
          country = geo ? geo.country : "Unknown";
          
          // Use ip-api.com just for city info (with timeout and fallback)
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 second timeout
            
            const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=city`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              city = data.city || "Unknown";
            } else {
              city = "Unknown";
            }
          } catch (error) {
            // Silently fail - city remains "Unknown"
            city = "Unknown";
          }
        }

        const visitor_id =
          clientIp !== "unknown"
            ? createHash("sha256")
                .update(`${clientIp}-${rawUa}`)
                .digest("hex")
                .substring(0, 16)
            : createHash("sha256")
                .update(rawUa || randomBytes(16).toString("hex"))
                .digest("hex")
                .substring(0, 16);

        const deviceType = { mobile: "Phone", tablet: "Tablet", desktop: "Desktop" }[
          parser.getDevice().type || "desktop"
        ] || "Other";

        let cleanReferrer = "Direct";
        const rawReferrer = req.headers.referer || "";
        if (rawReferrer) {
          try {
            const hostname = new URL(rawReferrer).hostname.toLowerCase();
            if (hostname.includes("t.co") || hostname.includes("twitter"))
              cleanReferrer = "Twitter";
            else if (hostname.includes("google")) cleanReferrer = "Google";
            else if (hostname.includes("facebook") || hostname.includes("fb.com"))
              cleanReferrer = "Facebook";
            else if (hostname.includes("instagram")) cleanReferrer = "Instagram";
            else if (hostname.includes("linkedin")) cleanReferrer = "LinkedIn";
            else if (hostname.includes("youtube")) cleanReferrer = "YouTube";
            else cleanReferrer = hostname.replace("www.", "");
          } catch (e) {
            cleanReferrer = "Direct";
          }
        }

        try {
          await database.prepare(
            "INSERT INTO clicks (id, channel_id, device, country, city, referrer, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).run(
            randomBytes(8).toString("hex"),
            channel.id,
            deviceType,
            country,
            city,
            cleanReferrer,
            visitor_id
          );
        } catch (err) {
          // Continue redirect even if click tracking fails
          console.error("Click tracking error:", err);
        }

        return res.redirect(link.original_url);
      }
    }

    // If not found in database, pass to next handler
    next();
  } catch (error) {
    console.error("Redirect handler error:", error);
    next();
  }
});

// SPA catch-all - serve index.html for all non-API routes
app.get("*", (req: any, res: any) => {
  try {
    // Don't serve SPA for API routes (shouldn't reach here but safety check)
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not found" });
    }
    
    // Skip static assets
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/i.test(req.path)) {
      return res.status(404).json({ error: "Not found" });
    }
    
    // For all other paths, serve the React SPA index.html
    // In serverless, try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, "../frontend/dist/index.html"),
      path.join(process.cwd(), "frontend/dist/index.html"),
      "/var/task/frontend/dist/index.html",
    ];
    
    let html = null;
    for (const indexPath of possiblePaths) {
      try {
        html = fs.readFileSync(indexPath, "utf-8");
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!html) {
      console.error("Could not find index.html in any of:", possiblePaths);
      return res.status(500).json({ error: "SPA file not found" });
    }
    
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("Failed to serve SPA:", error);
    res.status(500).json({ error: "Failed to serve application" });
  }
});

// Export app for Vercel serverless
export default app;

// Start the server (Railway / local production)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`live.fyi API running on port ${PORT}`);
});
