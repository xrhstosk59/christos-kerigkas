// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/db/database.types'

/**
 * Ανανεώνει το Supabase session και διαχειρίζεται τα cookies
 * Χρησιμοποιείται από το main middleware
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Ορισμός cookies στο request για τα επόμενα middleware
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          
          // Δημιουργία νέου response με τα updated cookies
          supabaseResponse = NextResponse.next({ request })
          
          // Ορισμός cookies στο response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              // Προσθήκη security options
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          )
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  )

  // Ανανέωση του session αν χρειάζεται
  // Χρησιμοποιούμε getUser() για verification
  const { data: { user }, error } = await supabase.auth.getUser()

  // Αν υπάρχει error ή δεν υπάρχει user, καθαρίζουμε τα auth cookies
  if (error || !user) {
    // Λίστα των Supabase auth cookies που πρέπει να καθαριστούν
    const authCookies = [
      'sb-auth-token',
      'sb-refresh-token',
      'sb-access-token',
    ]

    authCookies.forEach(cookieName => {
      request.cookies.delete(cookieName)
      supabaseResponse.cookies.delete(cookieName)
    })
  }

  // Προσθήκη custom headers για debugging (μόνο σε development)
  if (process.env.NODE_ENV === 'development') {
    supabaseResponse.headers.set('X-Supabase-Auth', user ? 'authenticated' : 'unauthenticated')
    if (user) {
      supabaseResponse.headers.set('X-User-ID', user.id)
    }
  }

  return supabaseResponse
}

/**
 * Helper για να ελέγξει αν ένας χρήστης έχει συγκεκριμένο ρόλο
 */
export async function checkUserRole(request: NextRequest, requiredRole: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { hasRole: false, user: null }
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Δεν χρειάζεται να ορίσουμε cookies εδώ
        },
      },
    }
  )

  // Χρήση getUser() για ασφαλή έλεγχο
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { hasRole: false, user: null }
  }

  // Έλεγχος ρόλου από τη βάση (διόρθωση: χρήση users table)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return { hasRole: false, user }
  }

  return {
    hasRole: userData.role === requiredRole,
    user,
    role: userData.role,
  }
}

/**
 * Helper για rate limiting με Supabase
 */
export async function checkRateLimit(
  request: NextRequest,
  identifier: string,
  limit: number = 10,
  window: number = 60 // seconds
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Αν δεν υπάρχει Supabase, επιτρέπουμε το request
    return { allowed: true, remaining: limit }
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const now = new Date()
  const windowStart = new Date(now.getTime() - window * 1000)

  // Έλεγχος για rate limit attempts στη βάση
  const { data: attempts, error } = await supabase
    .from('rate_limit_attempts')
    .select('id')
    .eq('identifier', identifier)
    .gte('created_at', windowStart.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    // Σε περίπτωση error, επιτρέπουμε το request
    return { allowed: true, remaining: limit }
  }

  const attemptCount = attempts?.length || 0
  const allowed = attemptCount < limit

  if (allowed) {
    // Καταγραφή του attempt με try/catch αντί για .catch()
    try {
      await supabase
        .from('rate_limit_attempts')
        .insert({ identifier })
    } catch (err) {
      console.error('Rate limit insert error:', err)
    }
  }

  return {
    allowed,
    remaining: Math.max(0, limit - attemptCount - 1),
    resetAt: new Date(windowStart.getTime() + window * 1000),
  }
}