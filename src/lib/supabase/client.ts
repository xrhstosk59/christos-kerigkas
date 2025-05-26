// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/db/database.types'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Singleton pattern για τον browser client
let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Δημιουργεί ή επιστρέφει τον υπάρχοντα Supabase browser client
 * Χρησιμοποιεί singleton pattern για να αποφύγει πολλαπλές instances
 */
export function createClient() {
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  client = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // Πιο ασφαλές για public clients
      },
      global: {
        headers: {
          'x-application-name': 'portfolio-website',
        },
      },
    }
  )

  return client
}

/**
 * Hook-style API για πιο εύκολη χρήση στα React components
 * @example
 * const supabase = useSupabase()
 */
export function useSupabase() {
  return createClient()
}

/**
 * Utility functions για συχνές λειτουργίες
 */
export const supabaseClient = {
  auth: {
    /**
     * Sign in με email και password
     * Χρησιμοποιεί getUser() για επιβεβαίωση του session
     */
    async signIn(email: string, password: string) {
      const client = createClient()
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      // Επιβεβαίωση με getUser() για extra security
      const { data: userData, error: userError } = await client.auth.getUser()
      
      if (userError || !userData.user) {
        return { error: userError || new Error('Failed to verify user') }
      }

      return { data: userData }
    },

    /**
     * Sign out και καθαρισμός του session
     */
    async signOut() {
      const client = createClient()
      const { error } = await client.auth.signOut()
      
      if (!error) {
        // Καθαρισμός τυχόν cached data
        if (typeof window !== 'undefined') {
          // Redirect στο login page
          window.location.href = '/admin/login'
        }
      }
      
      return { error }
    },

    /**
     * Λήψη του current user με verification
     * Πάντα χρησιμοποιούμε getUser() αντί για getSession()
     */
    async getCurrentUser() {
      const client = createClient()
      const { data, error } = await client.auth.getUser()
      
      return { user: data.user, error }
    },

    /**
     * Έλεγχος αν ο χρήστης είναι authenticated
     */
    async isAuthenticated() {
      const { user } = await this.getCurrentUser()
      return !!user
    },

    /**
     * Listener για αλλαγές στο auth state
     */
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      const client = createClient()
      return client.auth.onAuthStateChange(callback)
    },
  },

  /**
   * Database operations με built-in error handling
   */
  db: {
    /**
     * Ασφαλές query με error handling
     */
    async query<T>(
      queryFn: (client: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: Error | null }>
    ): Promise<{ data: T | null; error: Error | null }> {
      try {
        const client = createClient()
        return await queryFn(client)
      } catch (error) {
        console.error('Database query error:', error)
        return { 
          data: null, 
          error: error instanceof Error ? error : new Error('Unknown database error')
        }
      }
    },
  },
}

// Type exports για χρήση σε άλλα αρχεία
export type SupabaseClient = ReturnType<typeof createClient>
export type { Database }