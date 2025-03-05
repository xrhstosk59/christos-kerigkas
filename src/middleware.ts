// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ensureUploadsDirectory } from './lib/ensure-uploads-dir'

// Server-side initialization: make sure uploads directory exists
if (typeof process !== 'undefined') {
  try {
    ensureUploadsDirectory();
  } catch (error) {
    console.error('Failed to ensure uploads directory exists:', error);
  }
}

export function middleware(request: NextRequest) {
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
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}