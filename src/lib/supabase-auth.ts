// src/lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { type Database as SupabaseDatabase } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Βελτιωμένος χειρισμός για την περίπτωση που λείπουν οι μεταβλητές
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase authentication client initialization may fail. ' + 
    'Please check environment variables: ' +
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Δημιουργία του client με conditional λογική
const isBrowser = typeof window !== 'undefined'
const shouldInitClient = isBrowser || (process.env.NODE_ENV === 'production' && !!supabaseUrl && !!supabaseAnonKey)

// Ορισμός τύπου για το Supabase client
type SupabaseClient = ReturnType<typeof createClient<SupabaseDatabase>>;

// Δημιουργία του client μόνο αν είμαστε σε browser ή αν έχουμε τις απαραίτητες μεταβλητές σε production
export const supabaseAuth: SupabaseClient | null = shouldInitClient 
  ? createClient<SupabaseDatabase>(
      supabaseUrl, 
      supabaseAnonKey, 
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'supabase.auth.token'
        }
      }
    )
  : null;

// Helper για έλεγχο αν το client είναι έγκυρο
export const isAuthClientValid = () => !!supabaseAuth

// Λειτουργίες για το authentication με έλεγχο εγκυρότητας
export async function signInWithEmailAndPassword(email: string, password: string) {
  if (!isAuthClientValid()) {
    throw new Error('Supabase auth client is not initialized')
  }
  return supabaseAuth!.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  if (!isAuthClientValid()) {
    return { error: new Error('Supabase auth client is not initialized') }
  }
  return supabaseAuth!.auth.signOut()
}

export function getUser() {
  if (!isAuthClientValid()) {
    return Promise.resolve({ data: { user: null }, error: new Error('Supabase auth client is not initialized') })
  }
  return supabaseAuth!.auth.getUser()
}

export function getSession() {
  if (!isAuthClientValid()) {
    return Promise.resolve({ data: { session: null }, error: new Error('Supabase auth client is not initialized') })
  }
  return supabaseAuth!.auth.getSession()
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!isAuthClientValid()) {
    console.warn('Supabase auth client is not initialized, cannot listen for auth changes')
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabaseAuth!.auth.onAuthStateChange(callback)
}