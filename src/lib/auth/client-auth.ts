'use client'

// src/lib/auth/client-auth.ts
import { createClient } from '@supabase/supabase-js';
import { UserSession } from './common';

// Τύπος για τα αποτελέσματα των λειτουργιών αυθεντικοποίησης
export interface AuthResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Κλάση για τη διαχείριση της αυθεντικοποίησης με Supabase (client-side)
class SupabaseClientAuth {
  private authClient: ReturnType<typeof createClient> | null = null;

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
  getClient() {
    if (!this.authClient) {
      throw new Error('Supabase Auth client is not initialized');
    }
    
    return this.authClient;
  }
}

// Singleton instance
export const supabaseAuthClient = new SupabaseClientAuth();

/**
 * Έλεγχος αν το Supabase Auth client είναι διαθέσιμο
 */
export function isAuthClientValid(): boolean {
  return supabaseAuthClient.isClientAvailable();
}

/**
 * Απλοποιημένο API για συχνές λειτουργίες αυθεντικοποίησης
 */
export const auth = {
  async signInWithPassword(email: string, password: string) {
    const client = supabaseAuthClient.getClient();
    return await client.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    const client = supabaseAuthClient.getClient();
    return await client.auth.signOut();
  },

  async getSession() {
    const client = supabaseAuthClient.getClient();
    return await client.auth.getSession();
  },

  async getUser() {
    const client = supabaseAuthClient.getClient();
    return await client.auth.getUser();
  }
};

/**
 * Client-side λογική για login με Supabase
 */
export async function loginWithSupabaseClient(email: string, password: string): Promise<AuthResult> {
  if (!isAuthClientValid()) {
    return { success: false, error: 'Auth client not available' };
  }
  
  try {
    const { data, error } = await auth.signInWithPassword(email, password);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Λήψη πληροφοριών τρέχοντος session (client-side)
 */
export async function getClientSession(): Promise<UserSession> {
  try {
    if (!isAuthClientValid()) {
      return { user: null, isAuthenticated: false };
    }
    
    const { data } = await auth.getSession();
    
    if (!data.session) {
      return { user: null, isAuthenticated: false };
    }
    
    // Λήψη ρόλου χρήστη από το session
    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email!,
        role: 'admin', // Απλοποιημένο - θα πρέπει να έρχεται από τη βάση
      },
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return { user: null, isAuthenticated: false };
  }
}