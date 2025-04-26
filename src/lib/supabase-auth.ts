// src/lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
// Χρησιμοποιούμε διαφορετικό όνομα για το εισαγόμενο τύπο για να αποφύγουμε τη σύγκρουση
import { type Database as SupabaseDatabase } from './database.types'

// Βεβαιωνόμαστε ότι χρησιμοποιούμε μόνο τις μεταβλητές περιβάλλοντος και όχι hardcoded τιμές
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Έλεγχος για την ύπαρξη των απαραίτητων μεταβλητών
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase authentication client initialization may fail. ' + 
    'Please check environment variables: ' +
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Create a single supabase client for interacting with authentication
export const supabaseAuth = createClient<SupabaseDatabase>(
  supabaseUrl || '', 
  supabaseAnonKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token'
    }
  }
)

// Λειτουργίες για το authentication
export async function signInWithEmailAndPassword(email: string, password: string) {
  return supabaseAuth.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabaseAuth.auth.signOut()
}

export function getUser() {
  return supabaseAuth.auth.getUser()
}

export function getSession() {
  return supabaseAuth.auth.getSession()
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabaseAuth.auth.onAuthStateChange(callback)
}