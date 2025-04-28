// src/middleware.ts
import type { NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Ανανέωση του session χρησιμοποιώντας το supabase middleware
  const updatedResponse = await updateSession(request)
  
  // Προσθήκη security headers στο updatedResponse
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    updatedResponse.headers.set(key, value)
  })

  // Έλεγχος εξουσιοδότησης για τις προστατευμένες διαδρομές
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Το authentication ελέγχεται στο updateSession
    // που ανανεώνει τα cookies
  }

  return updatedResponse
}

export const config = {
  matcher: [
    /*
     * Αντιστοίχιση όλων των request paths εκτός από:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     * - api routes που δεν χρειάζονται αυθεντικοποίηση
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/contact|api/newsletter).*)',
  ],
}