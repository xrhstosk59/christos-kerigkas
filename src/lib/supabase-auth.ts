// src/lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js'
// Χρησιμοποιούμε διαφορετικό όνομα για το εισαγόμενο τύπο για να αποφύγουμε τη σύγκρουση
import { type Database as SupabaseDatabase } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnwbnlbmlqoxypsqdqii.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRud2JubGJtbHFveHlwc3FkcWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTY1MTMsImV4cCI6MjA1NjY5MjUxM30.BGccF5Y_Vya1ayC_eg9GpuchurJj2Ru8nF07RpUoYlA'

// Create a single supabase client for interacting with authentication
export const supabaseAuth = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase.auth.token'
  }
})

// Οι παρακάτω τύποι μπορούν να μείνουν σχολιασμένοι καθώς πλέον εισάγουμε τον τύπο από άλλο αρχείο
/*
// Τύπος για τη βάση δεδομένων - προσθέστε το σε νέο αρχείο src/lib/database.types.ts
// Αυτός είναι ένας απλοποιημένος τύπος, ιδανικά θα παράγεται αυτόματα από το Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: number
          slug: string
          title: string
          description: string
          content: string
          date: string
          image: string
          author_name: string
          author_image: string
          categories: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          title: string
          description: string
          content: string
          date: string
          image: string
          author_name: string
          author_image: string
          categories: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          description?: string
          content?: string
          date?: string
          image?: string
          author_name?: string
          author_image?: string
          categories?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
*/