// src/lib/auth/supabase-auth-client.ts
'use client'

import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

/**
 * Client-side authentication manager για Supabase
 * Χρησιμοποιείται μόνο σε browser environments
 */
export const supabaseClient = {
  /**
   * Έλεγχος αν το client είναι διαθέσιμο (browser environment)
   */
  isClientAvailable(): boolean {
    return typeof window !== 'undefined'
  },

  /**
   * Λήψη του Supabase client
   */
  getClient() {
    if (!this.isClientAvailable()) {
      throw new Error('Supabase client is only available in browser environment')
    }
    return createClient()
  },

  /**
   * Authentication methods
   */
  auth: {
    /**
     * Sign in με email και password
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

      // Επιβεβαίωση με getUser()
      const { data: userData, error: userError } = await client.auth.getUser()
      
      if (userError || !userData.user) {
        return { error: userError || new Error('Failed to verify user') }
      }

      return { data: userData, error: null }
    },

    /**
     * Sign out
     */
    async signOut() {
      const client = createClient()
      const { error } = await client.auth.signOut()
      
      if (!error && typeof window !== 'undefined') {
        // Καθαρισμός local state και redirect
        window.location.href = '/admin/login'
      }
      
      return { error }
    },

    /**
     * Λήψη του current user
     */
    async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
      const client = createClient()
      const { data, error } = await client.auth.getUser()
      
      return { user: data.user, error }
    },

    /**
     * Έλεγχος authentication status
     */
    async isAuthenticated(): Promise<boolean> {
      const { user } = await this.getCurrentUser()
      return !!user
    },

    /**
     * Update user password
     */
    async updateUser(options: { password: string }) {
      const client = createClient()
      const { error } = await client.auth.updateUser({
        password: options.password
      })

      return { error }
    },

    /**
     * Auth state change listener
     */
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      const client = createClient()
      return client.auth.onAuthStateChange(callback)
    },

    /**
     * Get current session
     */
    async getSession() {
      const client = createClient()
      const { data, error } = await client.auth.getSession()
      return { session: data.session, error }
    }
  },

  /**
   * Database operations με client
   */
  db: {
    /**
     * Generic query function
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
    }
  }
}

// Export για χρήση σε components
export default supabaseClient