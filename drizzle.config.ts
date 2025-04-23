// drizzle.config.ts
import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Φόρτωση μεταβλητών περιβάλλοντος από .env.local
dotenv.config({ path: '.env.local' })

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // Use dialect instead of driver
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres.tnwbnlbmlqoxypsqdqii:Xrhstos1@!#$@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  },
  verbose: true,
  strict: true,
} satisfies Config;