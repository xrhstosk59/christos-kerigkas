// drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Ensure we're loading environment variables
// Make sure .env.local exists and contains DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please check your .env.local file.');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});