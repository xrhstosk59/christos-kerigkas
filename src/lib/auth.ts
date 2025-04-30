// src/lib/auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Τύποι για καλύτερο type safety
export interface UserSession {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  } | null;
  isAuthenticated: boolean;
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

// Απλή σύγκριση passwords - δεν χρησιμοποιούμε πλεόν crypto module
export function validatePassword(password: string): boolean {
  // ΠΡΟΣΟΧΗ: Αυτό δεν είναι ασφαλές για παραγωγή!
  // Σε παραγωγικό περιβάλλον, χρησιμοποιήστε bcrypt ή κάτι παρόμοιο
  // και αποθηκεύστε μόνο το hash του password
  return password === ADMIN_PASSWORD;
}

// Τύπος για τις επιλογές των cookies (συμβατός με το Next.js API)
interface CookieOptions {
  name?: string;
  value?: string;
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Server-side Supabase client
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string) {
          cookieStore.delete(name);
        },
      },
    }
  );
}

// Αυθεντικοποίηση για προστατευμένες σελίδες
export async function checkAuth() {
  // Αν χρησιμοποιούμε Supabase
  if (process.env.USE_SUPABASE_AUTH === 'true') {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      redirect('/admin/login');
    }
    
    // Έλεγχος δικαιωμάτων admin
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userData || userData.role !== 'admin') {
      redirect('/');
    }
    
    return;
  }
  
  // Αλλιώς χρησιμοποιούμε το απλό σύστημα αυθεντικοποίησης
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  
  if (!authToken || !(await validateSecureToken(authToken))) {
    redirect('/admin/login');
  }
}

// Προστασία API routes
export async function protectApiRoute(req: NextRequest): Promise<NextResponse | null> {
  // Αν χρησιμοποιούμε Supabase
  if (process.env.USE_SUPABASE_AUTH === 'true') {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookiesObj: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookiesObj[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
    
    // Δημιουργία Supabase client με τα cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            cookie: cookieHeader
          }
        }
      }
    );
    
    // Έλεγχος session
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Έλεγχος ρόλου admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    return null;
  }
  
  // Αλλιώς χρησιμοποιούμε το απλό σύστημα αυθεντικοποίησης
  const cookieHeader = req.headers.get('cookie') || '';
  const authTokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  const authToken = authTokenMatch ? authTokenMatch[1] : null;
  
  if (!authToken || !(await validateSecureToken(authToken))) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }
  
  return null;
}

// Server action για login με το απλό σύστημα
export async function loginAdmin(formData: FormData) {
  const usernameInput = formData.get('username') as string;
  const password = formData.get('password') as string;
  
  if (usernameInput !== ADMIN_USERNAME || !validatePassword(password)) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  const token = await generateSecureToken(usernameInput);
  
  // Το token θα πρέπει να αποθηκευτεί σε cookie από τον controller
  return { success: true, token };
}

// Server action για login με Supabase
export async function loginWithSupabase(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }
  
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Έλεγχος ρόλου
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      await supabase.auth.signOut();
      return { success: false, error: 'Unauthorized access' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Η συνάρτηση για την αποσύνδεση με το απλό σύστημα
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/admin/login');
}

// Η συνάρτηση για την αποσύνδεση με Supabase
export async function logoutWithSupabase() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// Unified logout
export async function logout() {
  if (process.env.USE_SUPABASE_AUTH === 'true') {
    await logoutWithSupabase();
  } else {
    await logoutAdmin();
  }
}

// Current session info for both authentication methods
export async function getCurrentSession(): Promise<UserSession> {
  // Αν χρησιμοποιούμε Supabase
  if (process.env.USE_SUPABASE_AUTH === 'true') {
    const supabase = await createServerSupabaseClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return { user: null, isAuthenticated: false };
    }
    
    // Έλεγχος ρόλου
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        role: userData?.role || 'user',
      },
      isAuthenticated: true,
    };
  }
  
  // Αλλιώς χρησιμοποιούμε το απλό σύστημα αυθεντικοποίησης
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  
  if (!authToken || !(await validateSecureToken(authToken))) {
    return { user: null, isAuthenticated: false };
  }
  
  // Επιστρέφουμε τις πληροφορίες χρήστη χωρίς να αποκωδικοποιήσουμε το token ξανά
  return {
    user: {
      id: 'admin',
      email: 'admin@example.com', // placeholder
      role: 'admin',
    },
    isAuthenticated: true,
  };
}