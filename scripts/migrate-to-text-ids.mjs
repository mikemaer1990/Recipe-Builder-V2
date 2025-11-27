import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration to TEXT IDs...');

    // Drop all tables to recreate with correct schema
    await sql.query(`DROP TABLE IF EXISTS saved_recipes CASCADE`);
    await sql.query(`DROP TABLE IF EXISTS dietary_preferences CASCADE`);
    await sql.query(`DROP TABLE IF EXISTS pantry_items CASCADE`);
    await sql.query(`DROP TABLE IF EXISTS users CASCADE`);

    console.log('✅ Dropped existing tables');

    // Create users table with TEXT ID
    await sql.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        hashed_password TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT email_provider_unique UNIQUE (email, google_id)
      )
    `);

    await sql.query(`CREATE INDEX idx_users_email ON users(email)`);
    await sql.query(`CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL`);

    console.log('✅ Created users table');

    // Create pantry_items table
    await sql.query(`
      CREATE TABLE pantry_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ingredient_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.query(`CREATE INDEX idx_pantry_user_id ON pantry_items(user_id)`);

    console.log('✅ Created pantry_items table');

    // Create dietary_preferences table
    await sql.query(`
      CREATE TABLE dietary_preferences (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_vegan BOOLEAN DEFAULT FALSE,
        is_pescatarian BOOLEAN DEFAULT FALSE,
        allergies JSONB DEFAULT '[]',
        custom_instructions TEXT DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Created dietary_preferences table');

    // Create saved_recipes table
    await sql.query(`
      CREATE TABLE saved_recipes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipe_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        ingredients JSONB NOT NULL,
        instructions JSONB NOT NULL,
        cook_time VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        servings INTEGER NOT NULL,
        nutrition_total JSONB NOT NULL,
        nutrition_per_serving JSONB NOT NULL,
        cuisine_type VARCHAR(100) NOT NULL,
        recipe_style VARCHAR(50) NOT NULL,
        tags JSONB DEFAULT '[]',
        saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sql.query(`CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id)`);
    await sql.query(`CREATE INDEX idx_saved_recipes_name ON saved_recipes(recipe_name)`);
    await sql.query(`CREATE INDEX idx_saved_recipes_cuisine ON saved_recipes(cuisine_type)`);
    await sql.query(`CREATE INDEX idx_saved_recipes_style ON saved_recipes(recipe_style)`);
    await sql.query(`CREATE INDEX idx_saved_recipes_saved_at ON saved_recipes(saved_at DESC)`);
    await sql.query(`CREATE INDEX idx_saved_recipes_ingredients_gin ON saved_recipes USING GIN (ingredients)`);

    console.log('✅ Created saved_recipes table');

    console.log('\n✅ Database migration completed successfully!');
    console.log('All tables now use TEXT IDs compatible with OAuth providers');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
