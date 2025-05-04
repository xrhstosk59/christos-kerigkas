// drizzle.config.ts
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Φορτώνουμε συγκεκριμένα το .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Έλεγχος για DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please check your .env.local file.');
}

export default defineConfig({
  schema: './src/lib/db/schema/index.ts', // Ενημερωμένο path για το schema
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});