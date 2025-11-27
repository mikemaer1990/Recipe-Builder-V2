import { config } from "dotenv";
import { sql } from "@vercel/postgres";

// Load environment variables
config({ path: ".env.local" });

async function fixUserIdDefault() {
  try {
    console.log("Checking current users table schema...");

    // Add DEFAULT to id column if it doesn't have one
    await sql`
      ALTER TABLE users
      ALTER COLUMN id SET DEFAULT gen_random_uuid()
    `;

    console.log("✓ Successfully added DEFAULT gen_random_uuid() to users.id column");

  } catch (error) {
    console.error("Error fixing users table:", error);
    throw error;
  }
}

fixUserIdDefault()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
