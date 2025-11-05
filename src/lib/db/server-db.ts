'use server';

// src/lib/db/server-db.ts
import { createClient } from '@/lib/supabase/server';
import type { SupabaseServerClient } from './database';

/**
 * Get Supabase database client for server-side operations
 * This replaces the old Drizzle client
 */
export async function getDbClient(): Promise<SupabaseServerClient> {
  return await createClient();
}

/**
 * Alias for getDbClient - for admin operations
 * Note: With Supabase, RLS policies control access
 */
export async function getAdminDbClient(): Promise<SupabaseServerClient> {
  return await createClient();
}

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const supabase = await getDbClient();

    // Simple query to test connection
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return {
        connected: false,
        message: `Database connection failed: ${error.message}`
      };
    }

    return {
      connected: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Helper function for repositories - ensures database connection
 */
export async function ensureDatabaseConnection(): Promise<SupabaseServerClient> {
  return await getDbClient();
}
