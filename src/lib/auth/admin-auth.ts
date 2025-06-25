// src/lib/auth/admin-auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/db/database.types';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

/**
 * Check if the request is from an authenticated admin user
 * Can be used in API routes
 */
export async function checkAdminAuth(_request?: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return { isAuthenticated: false, user: null };
    }

    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { isAuthenticated: false, user: null };
    }

    // For now, we'll consider any authenticated user as admin
    // In a real app, you'd check user role from database
    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        role: 'admin'
      }
    };

  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, user: null };
  }
}