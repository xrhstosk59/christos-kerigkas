// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Security headers
  const headers = new Headers(request.headers)
  
  // Create response with security headers
  const response = NextResponse.next({
    request: {
      headers,
    },
  })
  
  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  
  // Handle redirects for old paths
  const url = request.nextUrl.clone()
  if (url.pathname === '/projects' || url.pathname === '/projects/') {
    url.pathname = '/#projects'
    return NextResponse.redirect(url)
  }
  
  // For admin routes, check authentication
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    // Initialize Supabase client
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    // If user is not authenticated, redirect to login page
    if (!session) {
      const redirectUrl = new URL('/admin/login', request.url)
      redirectUrl.searchParams.set('from', url.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    // Ταιριάζει όλα τα paths εκτός από συγκεκριμένα στατικά αρχεία
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    // Προστατεύει όλα τα admin paths
    '/admin/:path*'
  ],
}