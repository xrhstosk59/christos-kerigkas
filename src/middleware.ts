// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

/**
 * Βελτιωμένα security headers για καλύτερη προστασία της εφαρμογής
 */
const securityHeaders: Record<string, string> = {
  // Αποτροπή της αυτόματης ανίχνευσης τύπων MIME 
  'X-Content-Type-Options': 'nosniff',
  
  // Αποτροπή εμφάνισης της σελίδας μέσα σε frames (προστασία από clickjacking)
  'X-Frame-Options': 'DENY',
  
  // Ενεργοποίηση του XSS φίλτρου και αποτροπή της εμφάνισης της σελίδας σε περίπτωση ανίχνευσης XSS
  'X-XSS-Protection': '1; mode=block',
  
  // Έλεγχος του τρόπου αποστολής του Referer header (αυξημένη προστασία προσωπικών δεδομένων)
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Έλεγχος πρόσβασης σε δυνατότητες του browser από την εφαρμογή
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  
  // Προστασία από επιθέσεις CSRF, XSS, και Clickjacking μέσω του HTTP Strict Transport Security
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

/**
 * Προσθήκη των security headers στην απάντηση
 * 
 * @param response Η απάντηση που θα εμπλουτιστεί με security headers
 */
function addSecurityHeaders(response: NextResponse): void {
  // Εφαρμογή των βασικών security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Προσθήκη Content-Security-Policy μόνο σε παραγωγικό περιβάλλον
  if (process.env.NODE_ENV === 'production') {
    const cspValue = [
      "default-src 'self'",
      // Επιτρέπει την εκτέλεση scripts από συγκεκριμένες πηγές
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      // Επιτρέπει styles από συγκεκριμένες πηγές
      "style-src 'self' 'unsafe-inline'",
      // Επιτρέπει εικόνες από συγκεκριμένες πηγές
      "img-src 'self' data: https://*.supabase.co https://www.googletagmanager.com",
      // Επιτρέπει fonts μόνο από την ίδια πηγή
      "font-src 'self'",
      // Επιτρέπει συνδέσεις μόνο σε συγκεκριμένες πηγές
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com",
      // Αποτρέπει την εμφάνιση της σελίδας μέσα σε frames
      "frame-ancestors 'none'",
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', cspValue);
  }
}

/**
 * Μία βελτιωμένη έκδοση της συνάρτησης cacheControl από το Next.js
 * 
 * @param res Το αντικείμενο NextResponse που θα εμπλουτιστεί με headers caching
 * @param path Η διαδρομή για την οποία ισχύουν οι ρυθμίσεις caching
 */
function setCacheControlHeaders(res: NextResponse, path: string): void {
  // Static assets (εικόνες, στυλ, scripts)
  if (
    path.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|css|js)$/i) ||
    path.startsWith('/_next/static') ||
    path.startsWith('/public/')
  ) {
    // Ισχυρό caching για στατικά assets
    res.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }
  // Uploaded files
  else if (path.startsWith('/uploads/')) {
    // Ισχυρό caching για αρχεία που έχουν ανέβει
    res.headers.set(
      'Cache-Control',
      'public, max-age=604800, immutable'
    );
  }
  // API routes
  else if (path.startsWith('/api/')) {
    // Κανένα caching για API routes
    res.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
  }
  // HTML σελίδες (όλες οι άλλες διαδρομές)
  else {
    // Μέτριο caching για HTML σελίδες
    res.headers.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
    );
  }
}

/**
 * Το κύριο middleware της εφαρμογής
 * 
 * @param req Το αντικείμενο αίτησης NextRequest
 * @returns Το αντικείμενο απάντησης NextResponse
 */
export async function middleware(req: NextRequest) {
  // Ανανέωση του session χρησιμοποιώντας το supabase middleware
  const response = await updateSession(req);
  
  // Προσθήκη security headers στην απάντηση
  addSecurityHeaders(response);
  
  const url = req.nextUrl;
  
  // Ανακατεύθυνση σε HTTPS σε παραγωγικό περιβάλλον
  if (
    process.env.NODE_ENV === 'production' && 
    req.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const httpsUrl = `https://${req.headers.get('host')}${url.pathname}${url.search}`;
    return NextResponse.redirect(httpsUrl);
  }
  
  // Προσθήκη Cache-Control headers
  setCacheControlHeaders(response, url.pathname);
  
  return response;
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