// src/lib/db/database.ts
import { createClient } from '@/lib/supabase/server';
import type { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Type for the Supabase client
export type SupabaseServerClient = SupabaseClient<Database>;

// Check if we're on the server
export const isServer = typeof window === 'undefined';

/**
 * Get a Supabase client for database operations
 * This replaces the old Drizzle database connection
 */
export async function getDb(): Promise<SupabaseServerClient> {
  return await createClient();
}

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const supabase = await getDb();

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
      message: 'Database connection is working properly'
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
 * Transaction helper - Supabase handles transactions differently
 * This is a placeholder for compatibility
 */
export async function transaction<T>(
  callback: (client: SupabaseServerClient) => Promise<T>
): Promise<T> {
  const db = await getDb();
  return await callback(db);
}

/**
 * Safe query utility for filtering data
 */
export function safeQuery<T extends Record<string, unknown>>(
  query: T,
  allowedFields: Array<keyof T>
): Partial<T> {
  const result: Partial<T> = {};

  for (const field of allowedFields) {
    if (field in query && query[field] !== undefined && query[field] !== null) {
      result[field] = query[field];
    }
  }

  return result;
}
