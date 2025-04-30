// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

// Συνάρτηση για την προσθήκη security headers
function addSecurityHeaders(response: NextResponse): void {
  // Βασικά security headers
  const securityHeaders: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY', // Πιο αυστηρό από SAMEORIGIN
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  };
  
  // Προσθήκη Content-Security-Policy μόνο σε παραγωγικό περιβάλλον
  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Content-Security-Policy'] = 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https://www.googletagmanager.com; " +
      "font-src 'self'; " +
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com; " +
      "frame-ancestors 'none';";
  }
  
  // Εφαρμογή των headers στην απάντηση
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

// Το κύριο middleware
export async function middleware(req: NextRequest) {
  // Ανανέωση του session χρησιμοποιώντας το supabase middleware
  const updatedResponse = await updateSession(req);
  
  // Προσθήκη security headers στην απάντηση
  addSecurityHeaders(updatedResponse);
  
  // Χειρισμός ειδικών διαδρομών και προστασίας
  const url = req.nextUrl;
  
  // Ανακατεύθυνση σε HTTPS σε παραγωγικό περιβάλλον
  if (
    process.env.NODE_ENV === 'production' && 
    req.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const httpsUrl = `https://${req.headers.get('host')}${url.pathname}${url.search}`;
    return NextResponse.redirect(httpsUrl);
  }
  
  // Cache-Control για static assets
  if (
    url.pathname.startsWith('/_next/static') || 
    url.pathname.startsWith('/public/') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    // Set strong caching for static assets
    updatedResponse.headers.set(
      'Cache-Control', 
      'public, max-age=31536000, immutable'
    );
  }
  
  return updatedResponse;
}

// Config για το middleware - αποφεύγουμε εφαρμογή σε διαδρομές που χρησιμοποιούν server components
export const config = {
  matcher: [
    {
      source: '/((?!api/auth|api/admin/login|admin/login|_next/static|_next/image|favicon.ico|public/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};