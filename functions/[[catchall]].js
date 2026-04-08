import { SignJWT, jwtVerify } from "jose";
import { createDatabase, initializeSchema, createDatabaseWrapper } from "./lib/db.ts";

const JWT_SECRET = new TextEncoder().encode("CHANGE_ME_SECRET");

// Cloudflare Pages Functions - Web API implementation
export async function onRequest(context) {
  const { request, env } = context;

  console.log(`[API] ${request.method} ${request.url}`);

  try {
    // Create database instance
    const db = createDatabase(env);
    await initializeSchema(db);
    const database = createDatabaseWrapper(db);

    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    console.log(`[API] Routing: ${method} ${path}`);

    // Health check
    if (method === 'GET' && path === '/api/health') {
      return new Response(JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Authentication routes
    if (method === 'POST' && path === '/api/auth/request-otp') {
      return await handleRequestOTP(request, database, env);
    }

    if (method === 'POST' && path === '/api/auth/verify-otp') {
      return await handleVerifyOTP(request, database);
    }

    if (method === 'GET' && path === '/api/auth/me') {
      return await handleAuthMe(request, database);
    }

    // Link management routes
    if (method === 'POST' && path === '/api/links') {
      return await handleCreateLink(request, database);
    }

    if (method === 'GET' && path === '/api/links') {
      return await handleGetLinks(request, database);
    }

    // Handle dynamic routes
    const linksMatch = path.match(/^\/api\/links\/([^\/]+)$/);
    if (linksMatch) {
      const linkId = linksMatch[1];

      if (method === 'GET') {
        return await handleGetLink(request, linkId, database);
      }

      if (method === 'PUT') {
        return await handleUpdateLink(request, linkId, database);
      }

      if (method === 'DELETE') {
        return await handleDeleteLink(request, linkId, database);
      }
    }

    // Tags routes
    const tagsMatch = path.match(/^\/api\/links\/([^\/]+)\/tags$/);
    if (tagsMatch && method === 'POST') {
      return await handleAddTag(request, tagsMatch[1], database);
    }

    const tagDeleteMatch = path.match(/^\/api\/links\/([^\/]+)\/tags\/([^\/]+)$/);
    if (tagDeleteMatch && method === 'DELETE') {
      return await handleDeleteTag(request, tagDeleteMatch[1], decodeURIComponent(tagDeleteMatch[2]), database);
    }

    // Channels routes
    const channelMatch = path.match(/^\/api\/links\/([^\/]+)\/channels$/);
    if (channelMatch && method === 'POST') {
      return await handleAddChannel(request, channelMatch[1], database);
    }
    
    const channelDeleteMatch = path.match(/^\/api\/links\/([^\/]+)\/channels\/([^\/]+)$/);
    if (channelDeleteMatch && method === 'DELETE') {
      return await handleDeleteChannel(request, channelDeleteMatch[1], channelDeleteMatch[2], database);
    }

    // Analytics route
    const analyticsMatch = path.match(/^\/api\/links\/([^\/]+)\/analytics$/);
    if (analyticsMatch && method === 'GET') {
      const linkId = analyticsMatch[1];
      return await handleGetAnalytics(request, linkId, database);
    }

    // SEO analysis route
    if (method === 'POST' && path === '/api/seo-analyze') {
      return await handleAnalyzeSEO(request);
    }

    // For API routes that don't match, return 404
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Known SPA routes - serve the React app
    // NOTE: Fetch from '/' not '/index.html' — Cloudflare 308-redirects /index.html → /
    const spaRoutes = ['/', '/login', '/dashboard'];
    const isSpaRoute = spaRoutes.includes(path) || path.startsWith('/links/');

    if (method === 'GET' && isSpaRoute) {
      const rootRequest = new Request(new URL('/', request.url).toString(), {
        method: 'GET',
        headers: request.headers,
      });
      return env.ASSETS.fetch(rootRequest);
    }

    // Unknown single-segment paths are treated as short URL slugs
    if (method === 'GET' && !path.includes('/', 1)) {
      const slug = path.substring(1);
      if (slug) {
        return await handleRedirect(request, slug, database);
      }
    }

    // Fallback: try to serve as a static asset, then fall back to SPA root
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      const rootRequest = new Request(new URL('/', request.url).toString(), {
        method: 'GET',
        headers: request.headers,
      });
      return env.ASSETS.fetch(rootRequest);
    }
    return assetResponse;

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Route handlers
async function handleRequestOTP(request, database, env) {
  try {
    const body = await request.json();
    const email = (body.email || "").toString().trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Upsert user
    const existingUser = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const userId = existingUser?.id || generateId();

    if (!existingUser) {
      await database.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, email);
    }

    await database
      .prepare("INSERT INTO otp_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)")
      .run(generateId(), email, code, expiresAt);

    // Use Resend for delivering the OTP
    try {
      // Use environment variable if available, otherwise fallback to the provided key
      const resendKey = (env && env.RESEND_API_KEY) ? env.RESEND_API_KEY : "re_KKA8BZmi_A5shQJyGPzd37vENybekfJC8";
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: 'live.fyi <onboarding@resend.dev>', // IMPORTANT: Change this to noreply@live.fyi after you verify your domain on Resend
          to: [email],
          subject: 'Your live.fyi login code',
          html: `<p>Your one-time login code is: <strong>${code}</strong></p><p>It expires in 15 minutes.</p>`
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("[OTP] Resend API error:", errorText);
      } else {
        console.log(`[OTP] Email sent successfully via Resend to ${email} (${code})`);
      }
    } catch (emailErr) {
      console.error("[OTP] Failed to send email via Resend:", emailErr);
    }

    return new Response(JSON.stringify({ success: true, message: "OTP sent to email" }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/auth/request-otp error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleVerifyOTP(request, database) {
  try {
    const body = await request.json();
    const email = (body.email || "").toString().trim().toLowerCase();
    const code = (body.code || "").toString().trim();

    if (!email || !code || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const otpRecord = await database
      .prepare("SELECT id, expires_at FROM otp_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1")
      .get(email, code);

    if (!otpRecord) {
      console.log("[OTP] No OTP record found for email:", email);
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      console.log("[OTP] OTP expired for email:", email);
      return new Response(JSON.stringify({ error: "OTP expired" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete used OTP
    await database.prepare("DELETE FROM otp_codes WHERE id = ?").run(otpRecord.id);

    const user = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (!user) {
      console.log("[OTP] No user found after OTP verification for email:", email);
      return new Response(JSON.stringify({ error: "No user found" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("[OTP] Creating token for user:", user.id, "Email:", email);

    const token = await new SignJWT({ userId: user.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    console.log("[OTP] Token created successfully");

    return new Response(JSON.stringify({ success: true, token, email }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/auth/verify-otp error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAuthMe(request, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    console.log("[AUTH] Authorization header:", authHeader ? "Present" : "Missing");

    if (!authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] Failed: Missing or invalid Bearer token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("[AUTH] Token present:", !!token, "Length:", token?.length);

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log("[AUTH] Token verified successfully. UserID:", payload.userId);

      const user = await database.prepare("SELECT id, email FROM users WHERE id = ?").get(payload.userId);
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ user }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.log("[AUTH] Token verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleCreateLink(request, database) {
  try {
    const body = await request.json();
    const { original_url, slug: slugInput, title } = body;
    console.log("[POST /api/links] Creating link - URL:", original_url);

    if (!isValidUrl(original_url)) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for optional authentication
    let userId = null;
    const authHeader = request.headers.get('authorization') || "";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
        console.log("[POST /api/links] Authenticated user:", userId);
      } catch (err) {
        console.log("[POST /api/links] Token verification failed, proceeding as guest");
      }
    }

    const id = generateId();
    const slug = slugInput || generateShortId();

    await database.prepare(
      "INSERT INTO links (id, user_id, original_url, slug, title) VALUES (?, ?, ?, ?, ?)"
    ).run(id, userId, original_url, slug, title || null);

    console.log("[POST /api/links] Link inserted - ID:", id, "Slug:", slug, "UserID:", userId || "GUEST");

    // Create Direct channel
    const directChannelId = generateId();
    await database.prepare(
      "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
    ).run(directChannelId, id, "Direct", slug);

    // Create QR channel
    const qrUrl = `${slug}-qr`;
    const qrChannelId = generateId();
    await database.prepare(
      "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
    ).run(qrChannelId, id, "QR", qrUrl);

    console.log("[POST /api/links] Returning response - ID:", id, "Slug:", slug);

    return new Response(JSON.stringify({ id, slug, original_url }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetLinks(request, database) {
  try {
    // Get user ID from token
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const links = await database
      .prepare(
        "SELECT id, original_url, slug, title FROM links WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId);

    // Fetch tags for each link
    const linksWithTags = await Promise.all(
      links.map(async (link) => {
        const tags = await database
          .prepare("SELECT tag FROM link_tags WHERE link_id = ?")
          .all(link.id);
        return {
          ...link,
          tags: tags.map((t) => t.tag),
        };
      })
    );

    return new Response(JSON.stringify(linksWithTags), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/links error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetLink(request, linkId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const link = await database
      .prepare("SELECT id, original_url, slug, title FROM links WHERE id = ? AND user_id = ?")
      .get(linkId, userId);

    if (!link) {
      return new Response(JSON.stringify({ error: "Link not found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch tags
    const tags = await database
      .prepare("SELECT tag FROM link_tags WHERE link_id = ?")
      .all(linkId);

    // Fetch channels with performance metrics
    const channels = await database
      .prepare(`
        SELECT 
          c.id, c.name, c.short_url,
          (SELECT COUNT(*) FROM clicks WHERE channel_id = c.id AND timestamp >= datetime('now', '-1 day')) as clicks_1d,
          (SELECT COUNT(*) FROM clicks WHERE channel_id = c.id AND timestamp >= datetime('now', '-7 days')) as clicks_7d,
          (SELECT COUNT(*) FROM clicks WHERE channel_id = c.id AND timestamp >= datetime('now', '-30 days')) as clicks_30d
        FROM channels c WHERE c.link_id = ?
      `)
      .all(linkId);

    return new Response(JSON.stringify({
      ...link,
      tags: tags.map((t) => t.tag),
      channels
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/links/:id error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleUpdateLink(request, linkId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { original_url, title, tags } = body;

    // Verify ownership
    const existingLink = await database
      .prepare("SELECT id FROM links WHERE id = ? AND user_id = ?")
      .get(linkId, userId);

    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update link
    await database
      .prepare("UPDATE links SET original_url = ?, title = ? WHERE id = ?")
      .run(original_url, title || null, linkId);

    // Update tags
    if (tags && Array.isArray(tags)) {
      // Delete existing tags
      await database.prepare("DELETE FROM link_tags WHERE link_id = ?").run(linkId);

      // Insert new tags
      for (const tag of tags) {
        await database
          .prepare("INSERT INTO link_tags (id, link_id, tag) VALUES (?, ?, ?)")
          .run(generateId(), linkId, tag);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("PUT /api/links/:id error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDeleteLink(request, linkId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify ownership
    const existingLink = await database
      .prepare("SELECT id FROM links WHERE id = ? AND user_id = ?")
      .get(linkId, userId);

    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete link (cascade will handle related records)
    await database.prepare("DELETE FROM links WHERE id = ?").run(linkId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("DELETE /api/links/:id error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAddTag(request, linkId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }

    const existingLink = await database.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found" }), { status: 404 });
    }

    const body = await request.json();
    const tag = (body.tag || "").toString().trim();
    if (!tag) {
       return new Response(JSON.stringify({ error: "Tag is required" }), { status: 400 });
    }

    const existingTag = await database.prepare("SELECT id FROM link_tags WHERE link_id = ? AND tag = ?").get(linkId, tag);
    if (!existingTag) {
      await database.prepare("INSERT INTO link_tags (id, link_id, tag) VALUES (?, ?, ?)").run(generateId(), linkId, tag);
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("POST /api/links/:id/tags error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

async function handleDeleteTag(request, linkId, tag, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }

    const existingLink = await database.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found" }), { status: 404 });
    }

    await database.prepare("DELETE FROM link_tags WHERE link_id = ? AND tag = ?").run(linkId, tag);

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("DELETE /api/links/:id/tags error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

async function handleAddChannel(request, linkId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }

    const existingLink = await database.prepare("SELECT id, slug FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), { status: 404 });
    }

    const body = await request.json();
    const name = (body.name || "").toString().trim();
    if (!name) {
       return new Response(JSON.stringify({ error: "Channel name is required" }), { status: 400 });
    }

    const shortUrl = `${existingLink.slug}-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const existingChannel = await database.prepare("SELECT id FROM channels WHERE link_id = ? AND name = ?").get(linkId, name);
    if (!existingChannel) {
      await database.prepare("INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)").run(generateId(), linkId, name, shortUrl);
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("POST /api/links/:id/channels error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

async function handleDeleteChannel(request, linkId, channelId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }

    const existingLink = await database.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), { status: 404 });
    }

    await database.prepare("DELETE FROM channels WHERE id = ? AND link_id = ?").run(channelId, linkId);

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("DELETE /api/links/:id/channels/:channelId error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

async function handleGetAnalytics(request, linkId, database) {
  try {
    const authHeader = request.headers.get('authorization') || "";
    let userId = null;

    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify ownership
    const link = await database
      .prepare("SELECT id FROM links WHERE id = ? AND user_id = ?")
      .get(linkId, userId);

    if (!link) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get timeframe from URL
    const url = new URL(request.url);
    const timeframe = url.searchParams.get("timeframe") || "30d";
    
    const timeframeMs = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "60d": 60 * 24 * 60 * 60 * 1000,
    };
    const cutoffDate = new Date(Date.now() - (timeframeMs[timeframe] || timeframeMs["30d"]));
    const cutoff = cutoffDate.toISOString().replace("T", " ").split(".")[0];

    // Get analytics data using REAL schema
    const joinClause = "JOIN channels ON clicks.channel_id = channels.id";
    const whereClause = "WHERE channels.link_id = ? AND clicks.timestamp >= ?";

    const totalClicks = await database
      .prepare(`SELECT COUNT(*) as count FROM clicks ${joinClause} ${whereClause}`)
      .get(linkId, cutoff);

    const uniqueVisits = await database
      .prepare(`SELECT COUNT(DISTINCT visitor_id) as count FROM clicks ${joinClause} ${whereClause} AND visitor_id IS NOT NULL`)
      .get(linkId, cutoff);

    const clicksByChannelRaw = await database
      .prepare(`SELECT channels.name, COUNT(*) as count FROM clicks ${joinClause} ${whereClause} GROUP BY channels.id`)
      .all(linkId, cutoff);
      
    const clicksByDeviceRaw = await database
      .prepare(`SELECT device, COUNT(*) as count FROM clicks ${joinClause} ${whereClause} GROUP BY device`)
      .all(linkId, cutoff);

    const clicksByReferrerRaw = await database
      .prepare(`SELECT referrer, COUNT(*) as count FROM clicks ${joinClause} ${whereClause} GROUP BY referrer`)
      .all(linkId, cutoff);
      
    const clicksByCityRaw = await database
      .prepare(`SELECT city, COUNT(*) as count FROM clicks ${joinClause} ${whereClause} GROUP BY city`)
      .all(linkId, cutoff);
      
    const clicksByCountryRaw = await database
      .prepare(`SELECT country, COUNT(*) as count FROM clicks ${joinClause} ${whereClause} GROUP BY country`)
      .all(linkId, cutoff);

    const is24h = timeframe === '24h';
    const groupExpr = is24h ? "STRFTIME('%Y-%m-%dT%H:%M:00Z', clicks.timestamp)" : "STRFTIME('%Y-%m-%dT%H:00:00Z', clicks.timestamp)";

    const timelineRaw = await database
      .prepare(`SELECT ${groupExpr} as date, COUNT(*) as count FROM clicks ${joinClause} ${whereClause} GROUP BY ${groupExpr}`)
      .all(linkId, cutoff);

    return new Response(JSON.stringify({
      totalVisits: totalClicks?.count || 0,
      uniqueVisits: uniqueVisits?.count || 0,
      clicksByChannel: clicksByChannelRaw || [],
      clicksByDevice: clicksByDeviceRaw || [],
      clicksByReferrer: clicksByReferrerRaw || [],
      clicksByCity: clicksByCityRaw || [],
      clicksByCountry: clicksByCountryRaw || [],
      timeline: timelineRaw || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/links/:id/analytics error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAnalyzeSEO(request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'live-fyi-bot/1.0',
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Could not fetch target" }), { status: 400 });
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : "";

    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    const image = imageMatch ? imageMatch[1].trim() : "";

    return new Response(JSON.stringify({
      title,
      description,
      image,
      aiSuggestions: {
         suggestedTitle: title ? title + " | Optimized" : "Optimized Title",
         suggestedDescription: description ? "Enhanced: " + description : "Optimized Description text..."
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("SEO Proxy error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}



async function handleRedirect(request, slug, database) {
  try {
    console.log("[REDIRECT] Looking up slug:", slug);

    // Find the channel by short_url
    const channel = await database
      .prepare("SELECT id, link_id, name FROM channels WHERE short_url = ?")
      .get(slug);

    if (!channel) {
      console.log("[REDIRECT] Channel not found for slug:", slug);
      return new Response("Link not found", { status: 404 });
    }

    // Get the original URL
    const link = await database
      .prepare("SELECT original_url FROM links WHERE id = ?")
      .get(channel.link_id);

    if (!link) {
      console.log("[REDIRECT] Link not found for channel:", channel.link_id);
      return new Response("Link not found", { status: 404 });
    }

    // Log the click
    const clickId = generateId();
    
    // Process Referrer
    const rawReferrer = request.headers.get('referer') || "";
    let cleanReferrer = "Direct";
    if (rawReferrer) {
      try {
        const hostname = new URL(rawReferrer).hostname.toLowerCase();
        if (hostname.includes("t.co") || hostname.includes("twitter")) cleanReferrer = "Twitter";
        else if (hostname.includes("google")) cleanReferrer = "Google";
        else if (hostname.includes("facebook") || hostname.includes("fb.com")) cleanReferrer = "Facebook";
        else if (hostname.includes("instagram")) cleanReferrer = "Instagram";
        else if (hostname.includes("linkedin")) cleanReferrer = "LinkedIn";
        else if (hostname.includes("youtube")) cleanReferrer = "YouTube";
        else cleanReferrer = hostname.replace("www.", "");
      } catch (e) {
        cleanReferrer = "Direct";
      }
    }

    // Process Device
    const rawUa = (request.headers.get('user-agent') || "").toLowerCase();
    let device = "Desktop";
    if (rawUa.includes("mobile") || rawUa.includes("android") || rawUa.includes("iphone")) {
      device = rawUa.includes("tablet") || rawUa.includes("ipad") ? "Tablet" : "Phone";
    }

    // Process Location (from CF headers)
    const country = request.cf?.country || "Unknown";
    const city = request.cf?.city || "Unknown";
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || "unknown";
    const visitor_id = `${ip}-${device}`.substring(0, 16);

    try {
      await database
        .prepare("INSERT INTO clicks (id, channel_id, device, country, city, referrer, visitor_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(clickId, channel.id, device, country, city, cleanReferrer, visitor_id);
    } catch (insertErr) {
      console.error("[REDIRECT] Insert Error:", insertErr);
    }

    console.log("[REDIRECT] Redirecting to:", link.original_url);

    // Redirect to the original URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': link.original_url,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error("[REDIRECT] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// Utility functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function generateId() {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateShortId() {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function analyzeUrlSEO(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; live.fyi/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;
    const description = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || null;

    return {
      title,
      description,
      url
    };
  } catch (error) {
    console.error("SEO analysis error:", error);
    return {
      title: null,
      description: null,
      url
    };
  }
}

export default {
  async fetch(request, env, ctx) {
    return onRequest({ request, env, ctx });
  }
};