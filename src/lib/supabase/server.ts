// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/db/database.types'
import type { User } from '@supabase/supabase-js'

/**
 * Δημιουργεί Supabase client για χρήση σε Server Components και Server Actions
 * Χρησιμοποιεί React cache για optimization
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Αγνοούμε errors από το cookie setting σε Server Components
            // που τρέχουν μετά το response streaming
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // False για server-side
        flowType: 'pkce',
      },
    }
  )
})

/**
 * Τύπος για user session με role
 */
export interface UserSession {
  user: (User & { role?: string }) | null;
  isAuthenticated: boolean;
}

/**
 * Helper function για ασφαλή λήψη user role από τη βάση
 */
async function getUserRole(userId: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return 'user' // Default role
    }

    return data?.role || 'user'
  } catch {
    return 'user' // Default role σε περίπτωση error
  }
}

/**
 * Λήψη του current session με user data
 * EXPORTED function που χρειάζεται στα API routes
 */
export async function getCurrentSession(): Promise<UserSession> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      user: null,
      isAuthenticated: false
    }
  }

  // Λήψη του role από τη βάση
  const role = await getUserRole(user.id)

  const userWithRole = {
    ...user,
    role
  }

  return {
    user: userWithRole,
    isAuthenticated: true
  }
}

/**
 * Έλεγχος authentication - EXPORTED function
 * Χρησιμοποιείται σε API routes που χρειάζονται auth
 */
export async function checkAuth(): Promise<User> {
  const session = await getCurrentSession()
  
  if (!session.isAuthenticated || !session.user) {
    throw new Error('Unauthorized')
  }
  
  return session.user
}

/**
 * API Route protection middleware - EXPORTED function
 * Επιστρέφει error response αν δεν είναι authenticated
 */
export async function protectApiRoute(_req: NextRequest): Promise<NextResponse | null> {
  try {
    await checkAuth()
    return null // Όλα OK, συνέχεια
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

/**
 * Utility functions για server-side operations
 */
export const supabaseServer = {
  auth: {
    /**
     * Λήψη του current user με verification
     * ΠΆΝΤΑ χρησιμοποιούμε getUser() για server-side
     */
    async getCurrentUser() {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.getUser()
      
      return { user: data.user, error }
    },

    /**
     * Έλεγχος αν ο χρήστης είναι authenticated
     */
    async isAuthenticated() {
      const { user } = await this.getCurrentUser()
      return !!user
    },

    /**
     * Λήψη του user με τον ρόλο του από τη βάση
     */
    async getUserWithRole() {
      const { user, error: authError } = await this.getCurrentUser()
      
      if (authError || !user) {
        return { user: null, role: null, error: authError }
      }

      const role = await getUserRole(user.id)

      return { 
        user, 
        role,
        error: null 
      }
    },

    /**
     * Sign out (Server Action)
     */
    async signOut() {
      const supabase = await createClient()
      const { error } = await supabase.auth.signOut()
      return { error }
    },

    /**
     * Require authentication - throws redirect αν δεν είναι authenticated
     */
    async requireAuth() {
      const { user } = await this.getCurrentUser()
      
      if (!user) {
        const { redirect } = await import('next/navigation')
        redirect('/admin/login?error=unauthenticated')
      }
      
      return user
    },

    /**
     * Require admin role - throws redirect αν δεν είναι admin
     */
    async requireAdmin() {
      const { user, role, error } = await this.getUserWithRole()
      
      if (error || !user) {
        const { redirect } = await import('next/navigation')
        redirect('/admin/login?error=unauthenticated')
      }
      
      if (role !== 'admin') {
        const { redirect } = await import('next/navigation')
        redirect('/?error=unauthorized')
      }
      
      return { user, role }
    },
  },

  /**
   * Database operations με authentication context
   */
  db: {
    /**
     * Ασφαλές query που περνάει αυτόματα το user context
     */
    async authenticatedQuery<T>(
      queryFn: (client: Awaited<ReturnType<typeof createClient>>, userId: string) => Promise<{ data: T | null; error: Error | null }>
    ): Promise<{ data: T | null; error: Error | null }> {
      try {
        const user = await supabaseServer.auth.requireAuth()
        const client = await createClient()
        
        // Το requireAuth() εγγυάται ότι το user δεν είναι null
        // αλλά το TypeScript δεν το καταλαβαίνει, οπότε προσθέτουμε check
        if (!user) {
          throw new Error('User is required for authenticated query')
        }
        
        return await queryFn(client, user.id)
      } catch (error) {
        console.error('Authenticated query error:', error)
        return { 
          data: null, 
          error: error instanceof Error ? error : new Error('Query failed')
        }
      }
    },
  },
}

/**
 * Login function για API routes
 * EXPORTED function που χρησιμοποιείται στο login API endpoint
 */
export async function loginWithSupabase(email: string, password: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Επιβεβαίωση με getUser()
    const { data: userCheckData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userCheckData.user) {
      return { success: false, error: 'Failed to verify authentication' }
    }

    // Έλεγχος ρόλου
    const role = await getUserRole(userCheckData.user.id)

    if (role !== 'admin') {
      await supabase.auth.signOut()
      return { success: false, error: 'Unauthorized access' }
    }

    return { 
      success: true, 
      user: userCheckData.user,
      session: data.session 
    }
  } catch (error) {
    console.error('Login error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Server Action για login
 */
export async function loginAction(email: string, password: string) {
  'use server'
  
  const result = await loginWithSupabase(email, password)
  
  if (!result.success) {
    return { error: result.error }
  }

  return { success: true }
}

/**
 * Server Action για logout
 */
export async function logoutAction() {
  'use server'
  
  const { error } = await supabaseServer.auth.signOut()
  
  if (!error) {
    const { redirect } = await import('next/navigation')
    redirect('/admin/login')
  }
  
  return { error }
}

// Type exports
export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
export type { Database }