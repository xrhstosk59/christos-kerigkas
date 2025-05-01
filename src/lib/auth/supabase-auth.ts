// src/lib/supabase-auth.ts
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Τύπος για τα αποτελέσματα των λειτουργιών αυθεντικοποίησης
export interface AuthResult {
  session: Session | null;
  user: User | null;
}

// Κλάση για τη διαχείριση της αυθεντικοποίησης με Supabase
class SupabaseAuthManager {
  private authClient: SupabaseClient | null = null;
  private isBuildTime: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Ελέγχουμε για server-side περιβάλλον
    const isServer = typeof window === 'undefined';
    this.isBuildTime = process.env.NODE_ENV === 'production' && isServer && 
      (process.env.NEXT_PHASE === 'phase-production-build');

    // Αποφεύγουμε τη δημιουργία του client κατά τη διάρκεια του static build
    if (this.isBuildTime) {
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        this.authClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            // Client-side χρησιμοποιεί persistent session
            persistSession: typeof window !== 'undefined',
            // Προσθήκη επιπλέον ρυθμίσεων αν χρειάζεται
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } else {
        console.warn(
          'Supabase Auth client initialization failed. ' +
          'Missing environment variables: ' +
          'NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY'
        );
      }
    } catch (error) {
      console.error('Error initializing Supabase Auth client:', error);
      this.authClient = null;
    }
  }

  // Έλεγχος αν το client είναι διαθέσιμο
  isClientAvailable(): boolean {
    return !this.isBuildTime && !!this.authClient;
  }

  // Ασφαλής πρόσβαση στο client
  getClient(): SupabaseClient {
    if (this.isBuildTime) {
      throw new Error('Supabase Auth client is not available during build time');
    }
    
    if (!this.authClient) {
      throw new Error('Supabase Auth client is not initialized');
    }
    
    return this.authClient;
  }

  // Ασφαλής εκτέλεση ενεργειών με χειρισμό σφαλμάτων
  async execute<T>(
    action: (client: SupabaseClient) => Promise<T>,
    errorMessage = 'Error executing Supabase Auth operation'
  ): Promise<T> {
    try {
      const client = this.getClient();
      return await action(client);
    } catch (error) {
      console.error(errorMessage, error);
      throw error;
    }
  }
}

// Singleton instance
export const supabaseAuthManager = new SupabaseAuthManager();

// Για συμβατότητα με υπάρχοντα κώδικα
export const supabaseAuth = supabaseAuthManager.isClientAvailable() 
  ? supabaseAuthManager.getClient() 
  : null;

/**
 * Έλεγχος αν το Supabase Auth client είναι διαθέσιμο
 * @returns true αν το client είναι διαθέσιμο, αλλιώς false
 */
export function isAuthClientValid(): boolean {
  return supabaseAuthManager.isClientAvailable();
}

/**
 * Ασφαλής πρόσβαση στο Auth client
 * @returns Το Supabase Auth client
 * @throws Error αν το client δεν είναι διαθέσιμο
 */
export function getAuthClient(): SupabaseClient {
  return supabaseAuthManager.getClient();
}

/**
 * Ένα απλοποιημένο API για τις συχνά χρησιμοποιούμενες λειτουργίες αυθεντικοποίησης
 */
export const auth = {
  /**
   * Σύνδεση με email και κωδικό
   * @param email Email χρήστη
   * @param password Κωδικός πρόσβασης
   * @returns Result του Supabase
   */
  async signInWithPassword(email: string, password: string) {
    const client = supabaseAuthManager.getClient();
    return await client.auth.signInWithPassword({ email, password });
  },

  /**
   * Αποσύνδεση χρήστη
   * @returns Result του Supabase
   */
  async signOut() {
    const client = supabaseAuthManager.getClient();
    return await client.auth.signOut();
  },

  /**
   * Λήψη του τρέχοντος session
   * @returns Session data ή null
   */
  async getSession() {
    const client = supabaseAuthManager.getClient();
    return await client.auth.getSession();
  },

  /**
   * Λήψη του τρέχοντος χρήστη
   * @returns User data ή null
   */
  async getUser() {
    const client = supabaseAuthManager.getClient();
    return await client.auth.getUser();
  }
};

// Εξαγωγή των utils από το νέο σύστημα auth.ts για συμβατότητα
export { loginWithSupabase, logoutWithSupabase } from './auth';