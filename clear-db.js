import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const tursoUrl = process.env.TURSO_CONNECTION_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error("Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN environment variables");
}

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

async function clearDatabase() {
  try {
    console.log("🗑️  Clearing all database tables...");
    
    // Clear tables in dependency order (reverse of creation)
    const tables = [
      "clicks",        // Depends on channels
      "channels",      // Depends on links
      "link_tags",     // Depends on links
      "links",         // Depends on users
      "otp_codes",     // Independent
      "users"          // Independent
    ];

    for (const table of tables) {
      await db.execute(`DELETE FROM ${table}`);
      console.log(`✓ Cleared ${table}`);
    }

    console.log("\n✅ All tables cleared successfully!");
    console.log("Database is ready for fresh start.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
