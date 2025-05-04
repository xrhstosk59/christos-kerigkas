// src/lib/auth/common.ts
// Κοινοί τύποι και συναρτήσεις που μπορούν να χρησιμοποιηθούν και σε client και σε server

import { Session, User } from '@supabase/supabase-js';

// Τύποι για καλύτερο type safety
export interface UserSession {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'user'; // Προσθήκη του 'editor' ως έγκυρη τιμή
  } | null;
  isAuthenticated: boolean;
}

// Τύπος για το authentication context συμβατός με την υπάρχουσα εφαρμογή
export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Fallback μόνο για development, όχι για παραγωγή
export const ADMIN_USERNAME = process.env.NODE_ENV === 'production' 
  ? process.env.ADMIN_USERNAME 
  : 'admin';

export const ADMIN_PASSWORD = process.env.NODE_ENV === 'production' 
  ? process.env.ADMIN_PASSWORD 
  : 'password123';

// JWT Secret για ψηφιακή υπογραφή (θα πρέπει να είναι env variable)
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-change-in-production';

// Ασφαλής κρυπτογράφηση token με HMAC (χρησιμοποιώντας Web Crypto API)
export async function generateSecureToken(username: string): Promise<string> {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  
  // Δημιουργία ασφαλούς token με Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const keyData = encoder.encode(JWT_SECRET);
  const key = await crypto.subtle.importKey(
    'raw', 
    keyData, 
    { name: 'HMAC', hash: 'SHA-256' }, 
    false, 
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Συνδυασμός payload και υπογραφής
  const token = btoa(`${payload}:${signatureHex}`);
  return token;
}

// Επικύρωση ασφαλούς token
export async function validateSecureToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const [username, timestamp, signature] = decoded.split(':');
    
    // Έλεγχος εγκυρότητας υπογραφής με Web Crypto API
    const payload = `${username}:${timestamp}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const keyData = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      'raw', 
      keyData, 
      { name: 'HMAC', hash: 'SHA-256' }, 
      false, 
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign('HMAC', key, data);
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (signature !== expectedSignatureHex) return false;
    
    // Έλεγχος αν το token έχει λήξει (24 ώρες)
    const now = Date.now();
    const tokenTime = parseInt(timestamp, 10);
    const isExpired = now - tokenTime > 24 * 60 * 60 * 1000;
    
    if (isExpired) return false;
    
    return username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

// Απλή σύγκριση passwords
export function validatePassword(password: string): boolean {
  // ΠΡΟΣΟΧΗ: Αυτό δεν είναι ασφαλές για παραγωγή!
  // Σε παραγωγικό περιβάλλον, χρησιμοποιήστε bcrypt ή κάτι παρόμοιο
  // και αποθηκεύστε μόνο το hash του password
  return password === ADMIN_PASSWORD;
}