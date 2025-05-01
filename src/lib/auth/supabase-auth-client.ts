// src/lib/supabase-auth-client.ts
'use client'

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Τύπος για τα αποτελέσματα των λειτουργιών αυθεντικοποίησης
export interface AuthResult {
  session: Session | null;
  user: User | null;
}

// Κλάση για τη διαχείριση της αυθεντικοποίησης με Supabase (client-side)
class SupabaseAuthManager {
  private authClient: SupabaseClient | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        this.authClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } else {
        console.warn(
          'Supabase Auth client initialization failed. ' +
          'Missing environment variables.'
        );
      }
    } catch (error) {
      console.error('Error initializing Supabase Auth client:', error);
      this.authClient = null;
    }
  }

  // Έλεγχος αν το client είναι διαθέσιμο
  isClientAvailable(): boolean {
    return !!this.authClient;
  }

  // Ασφαλής πρόσβαση στο client
  getClient(): SupabaseClient {
    if (!this.authClient) {
      throw new Error('Supabase Auth client is not initialized');
    }
    
    return this.authClient;
  }
}

// Singleton instance
export const supabaseAuthManager = new SupabaseAuthManager();

/**
 * Έλεγχος αν το Supabase Auth client είναι διαθέσιμο
 */
export function isAuthClientValid(): boolean {
  return supabaseAuthManager.isClientAvailable();
}

/**
 * Απλοποιημένο API για συχνές λειτουργίες αυθεντικοποίησης
 */
export const auth = {
  async signInWithPassword(email: string, password: string) {
    const client = supabaseAuthManager.getClient();
    return await client.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    const client = supabaseAuthManager.getClient();
    return await client.auth.signOut();
  },

  async getSession() {
    const client = supabaseAuthManager.getClient();
    return await client.auth.getSession();
  },

  async getUser() {
    const client = supabaseAuthManager.getClient();
    return await client.auth.getUser();
  }
};