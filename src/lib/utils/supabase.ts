// src/lib/utils/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Κλάση για χειρισμό σφαλμάτων του Supabase
export class SupabaseError extends Error {
  originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'SupabaseError';
    this.originalError = originalError;
  }
}

// Τύποι για το supabaseManager
interface SupabaseManager {
  initialize(): void;
  getClient(): SupabaseClient;
  isClientAvailable(): boolean;
}

// Singleton manager για το client του Supabase
class SupabaseClientManager implements SupabaseManager {
  private client: SupabaseClient | null = null;
  private initialized = false;

  initialize(): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new SupabaseError('Λείπουν οι μεταβλητές περιβάλλοντος για το Supabase. Ελέγξτε το .env αρχείο.');
    }

    try {
      this.client = createClient(supabaseUrl, supabaseAnonKey);
      this.initialized = true;
    } catch (error) {
      console.error('Σφάλμα κατά την αρχικοποίηση του Supabase client:', error);
      throw new SupabaseError('Αποτυχία αρχικοποίησης του Supabase client', error);
    }
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      this.initialize();
    }
    if (!this.client) {
      throw new SupabaseError('Ο Supabase client δεν μπόρεσε να αρχικοποιηθεί.');
    }
    return this.client;
  }

  isClientAvailable(): boolean {
    return this.initialized && this.client !== null;
  }
}

// Δημιουργία και εξαγωγή του singleton manager
export const supabaseManager = new SupabaseClientManager();

// Αρχικοποίηση του client κατά την εισαγωγή του module (όπου αυτό είναι εφικτό)
if (typeof window !== 'undefined') {
  try {
    supabaseManager.initialize();
  } catch (error) {
    console.error('Αποτυχία αυτόματης αρχικοποίησης του Supabase:', error);
    // Δεν πετάμε το σφάλμα εδώ για να μην σπάσει η εφαρμογή
    // Θα γίνει έλεγχος με το isClientAvailable() πριν τη χρήση
  }
}