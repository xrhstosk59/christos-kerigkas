// src/middleware.ts - Minimal version for stability
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple pass-through - no processing
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}