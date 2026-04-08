import { createClient } from "@libsql/client";

export function createDatabase(env) {
  const tursoUrl = env.TURSO_CONNECTION_URL;
  const tursoToken = env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    throw new Error("Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN environment variables");
  }

  return createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
}

// Initialize database schema
export async function initializeSchema(database) {
  try {
    const result = await database.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTables = new Set(result.rows.map(r => r.name));

    if (!existingTables.has("users")) {
      await database.execute(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    if (!existingTables.has("otp_codes")) {
      await database.execute(`
        CREATE TABLE otp_codes (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    if (!existingTables.has("links")) {
      await database.execute(`
        CREATE TABLE links (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          original_url TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
    }

    if (!existingTables.has("channels")) {
      await database.execute(`
        CREATE TABLE channels (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          name TEXT NOT NULL,
          short_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
        )
      `);
    }

    if (!existingTables.has("clicks")) {
      await database.execute(`
        CREATE TABLE clicks (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          channel_name TEXT,
          referrer TEXT,
          user_agent TEXT,
          ip TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
        )
      `);
    }

    if (!existingTables.has("link_tags")) {
      await database.execute(`
        CREATE TABLE link_tags (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
        )
      `);
    }

  } catch (error) {
    console.error("Schema initialization error:", error);
  }
}