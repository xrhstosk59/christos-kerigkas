// src/lib/auth/server-auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { UserSession, ADMIN_USERNAME, validatePassword, validateSecureToken, generateSecureToken } from './common';

// Τύπος για τις επιλογές των cookies
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

/**
 * Server-side Supabase client - χρησιμοποιεί next/headers και λειτουργεί μόνο σε Server Components
 */
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

/**
 * Αυθεντικοποίηση για προστατευμένες σελίδες (server-side μόνο)
 */
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

/**
 * Προστασία API routes (server-side)
 */
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

/**
 * Server action για login με το απλό σύστημα
 */
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

/**
 * Server action για login με Supabase
 */
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

/**
 * Η συνάρτηση για την αποσύνδεση με το απλό σύστημα (server-side)
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/admin/login');
}

/**
 * Η συνάρτηση για την αποσύνδεση με Supabase (server-side)
 */
export async function logoutWithSupabase() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

/**
 * Unified logout (server-side)
 */
export async function logout() {
  if (process.env.USE_SUPABASE_AUTH === 'true') {
    await logoutWithSupabase();
  } else {
    await logoutAdmin();
  }
}

/**
 * Current session info for both authentication methods (server-side)
 */
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