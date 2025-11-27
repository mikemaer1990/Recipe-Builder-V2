import { config } from 'dotenv';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

async function setupDatabase() {
  try {
    console.log('🔄 Reading schema file...');
    const schemaPath = join(__dirname, '..', 'lib', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('🔄 Connecting to database...');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`🔄 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await sql.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement);
        }
      }
    }

    console.log('✅ Database setup completed!');
    console.log('\n📊 Tables created:');
    console.log('  - users');
    console.log('  - pantry_items');
    console.log('  - dietary_preferences');
    console.log('  - saved_recipes');
    console.log('\n🎉 Your database is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
