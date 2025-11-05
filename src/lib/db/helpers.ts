// src/lib/db/helpers.ts
import { createClient } from '@/lib/supabase/server';
import type { SupabaseServerClient } from './database';

/**
 * Ensures database connection by returning a Supabase client.
 * This replaces the old Drizzle connection helper.
 */
export async function ensureDatabaseConnection(): Promise<SupabaseServerClient> {
  return await createClient();
}
