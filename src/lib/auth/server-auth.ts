// src/lib/auth/server-auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { CookieSerializeOptions } from 'cookie';
import { UserSession } from './common';

// Χρησιμοποιούμε τον τύπο που είναι συμβατός με το cookie store
type CookieOptions = Partial<CookieSerializeOptions>;

/**
 * Server-side Supabase client - χρησιμοποιεί next/headers και λειτουργεί μόνο σε Server Components
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Μετατροπή του sameSite σε τύπο που αναμένεται
          if (options.sameSite === true) {
            options.sameSite = 'strict';
          } else if (options.sameSite === false) {
            options.sameSite = 'lax';
          }
          
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
  const supabase = await createServerSupabaseClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    redirect('/admin/login');
  }
  
  // Έλεγχος δικαιωμάτων admin
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (userError || !userData || userData.role !== 'admin') {
    redirect('/');
  }
}

/**
 * Προστασία API routes (server-side)
 */
export async function protectApiRoute(req: NextRequest): Promise<NextResponse | null> {
  // Δημιουργία Supabase client από cookies στο αίτημα
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }
  
  // Εναλλακτική δημιουργία cookies object
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name);
          return cookie?.value;
        },
        // Ορίζουμε dummy λειτουργίες που δεν χρησιμοποιούνται στο context του API
        set(_name: string, _value: string, _options: CookieOptions) {
          // Not used in API routes
        },
        remove(_name: string) {
          // Not used in API routes
        },
      },
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
    
    if (!data.user || !data.user.id) {
      return { success: false, error: 'Authentication failed' };
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
 * Η συνάρτηση για την αποσύνδεση με Supabase (server-side)
 */
export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

/**
 * Current session info (server-side)
 */
export async function getCurrentSession(): Promise<UserSession> {
  const supabase = await createServerSupabaseClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return { user: null, isAuthenticated: false };
  }
  
  // Ασφαλής έλεγχος για το email
  const email = session.user.email || '';
  
  // Έλεγχος ρόλου
  const { data: userData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  return {
    user: {
      id: session.user.id,
      email: email,
      role: userData?.role || 'user',
    },
    isAuthenticated: true,
  };
}