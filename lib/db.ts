import { createClient } from "@libsql/client";

export function createDatabase(env: any) {
  const tursoUrl = env.TURSO_CONNECTION_URL;
  const tursoToken = env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.warn("⚠️  TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN not set — database disabled");
    return null;
  }

  return createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
}

// Initialize database schema
export async function initializeSchema(dbInstance: any) {
  if (!dbInstance) {
    console.warn("⚠️  Skipping schema init — no database configured");
    return;
  }
  try {
    const result = await dbInstance.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTables = new Set((result.rows as any[]).map(r => r.name));

    if (!existingTables.has("links")) {
      await dbInstance.execute(`
        CREATE TABLE links (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          original_url TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          title TEXT,
          tag TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      try {
        await dbInstance.execute(`ALTER TABLE links ADD COLUMN user_id TEXT`);
      } catch (err) {
        // Column likely already exists, silently continue
      }
    }

    if (!existingTables.has("channels")) {
      await dbInstance.execute(`
        CREATE TABLE channels (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          name TEXT NOT NULL,
          short_url TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE
        )
      `);
    }

    if (!existingTables.has("clicks")) {
      await dbInstance.execute(`
        CREATE TABLE clicks (
          id TEXT PRIMARY KEY,
          channel_id TEXT NOT NULL,
          device TEXT,
          country TEXT,
          city TEXT,
          referrer TEXT,
          visitor_id TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE
        )
      `);
    }

    if (!existingTables.has("link_tags")) {
      await dbInstance.execute(`
        CREATE TABLE link_tags (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE,
          UNIQUE(link_id, tag)
        )
      `);
    }

    if (!existingTables.has("users")) {
      await dbInstance.execute(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    if (!existingTables.has("otp_codes")) {
      await dbInstance.execute(`
        CREATE TABLE otp_codes (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    console.log("Database schema initialized successfully");
  } catch (error: any) {
    if (!error.message?.includes("already exists")) {
      console.log("Database ready");
    }
  }
}

// Database wrapper for easier usage
export function createDatabaseWrapper(dbInstance: any) {
  const noDb = () => { throw new Error("Database not configured — set TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN env vars in Railway"); };

  if (!dbInstance) {
    return {
      prepare: (_sql: string) => ({
        run: async (..._params: any[]) => noDb(),
        get: async (..._params: any[]) => noDb(),
        all: async (..._params: any[]) => noDb(),
      }),
      execute: async (_sql: string, _params: any[] = []) => noDb(),
    };
  }

  return {
    prepare: (sql: string) => ({
      run: async (...params: any[]) => {
        try {
          const result = await dbInstance.execute({ sql, args: params });
          return { changes: result.rowsAffected || 1 };
        } catch (err) {
          console.error("Database run error:", err, "SQL:", sql, "Params:", params);
          throw err;
        }
      },
      get: async (...params: any[]) => {
        try {
          const result = await dbInstance.execute({ sql, args: params });
          if (!result.rows || result.rows.length === 0) return null;
          const row = result.rows[0];
          if (typeof row === 'object' && row !== null) {
            return row as any;
          }
          return null;
        } catch (err) {
          console.error("Database get error:", err, "SQL:", sql, "Params:", params);
          throw err;
        }
      },
      all: async (...params: any[]) => {
        try {
          const result = await dbInstance.execute({ sql, args: params });
          return (result.rows as any[]) || [];
        } catch (err) {
          console.error("Database all error:", err, "SQL:", sql, "Params:", params);
          throw err;
        }
      },
    }),
    
    execute: async (sql: string, params: any[] = []) => {
      return await dbInstance.execute({ sql, args: params });
    },
  };
}

