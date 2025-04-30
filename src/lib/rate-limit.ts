// src/lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

// Τύπος παραμετροποίησης για το rate limiting
export interface RateLimitConfig {
  limit: number;         // Μέγιστος αριθμός αιτημάτων
  window: number;        // Χρονικό παράθυρο σε δευτερόλεπτα
  identifier?: string;   // Προαιρετικό αναγνωριστικό για το rate limiting
}

// Τύπος αποτελέσματος για το επιτυχές rate limiting
export interface RateLimitSuccess {
  success: true;
  headers: {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
  };
}

// Βοηθητική κλάση για το rate limiting
export class RateLimiter {
  // Fallback in-memory store για development
  private localStore: Map<string, { count: number; expires: number }> = new Map();

  // Καθαρισμός του local store από ληγμένες καταχωρήσεις
  private cleanupLocalStore(): void {
    const now = Date.now();
    for (const [key, value] of this.localStore.entries()) {
      if (value.expires < now) {
        this.localStore.delete(key);
      }
    }
  }

  // Έλεγχος αν έχει ξεπεραστεί το όριο
  public check(
    config: RateLimitConfig,
    identifier: string
  ): { success: boolean; remaining: number; reset: number } {
    const { limit, window } = config;
    const key = `rate-limit:${identifier}`;
    
    // Χρήση τοπικής αποθήκευσης
    this.cleanupLocalStore(); // Καθαρισμός ληγμένων καταχωρήσεων
    
    const now = Date.now();
    const expires = now + window * 1000;
    
    const entry = this.localStore.get(key);
    
    if (!entry) {
      // Πρώτο αίτημα
      this.localStore.set(key, { count: 1, expires });
      return {
        success: true,
        remaining: limit - 1,
        reset: Math.floor(expires / 1000),
      };
    }
    
    // Έλεγχος αν έχει λήξει το παράθυρο
    if (entry.expires < now) {
      // Επαναφορά μετρητή
      this.localStore.set(key, { count: 1, expires });
      return {
        success: true,
        remaining: limit - 1,
        reset: Math.floor(expires / 1000),
      };
    }
    
    // Αύξηση του μετρητή
    const newCount = entry.count + 1;
    this.localStore.set(key, { count: newCount, expires: entry.expires });
    
    // Έλεγχος ορίου
    const remaining = Math.max(0, limit - newCount);
    
    return {
      success: newCount <= limit,
      remaining,
      reset: Math.floor(entry.expires / 1000),
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Middleware για εφαρμογή rate limiting σε API routes
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = { limit: 10, window: 60 }
): Promise<NextResponse | RateLimitSuccess> {
  // Λήψη IP από header X-Forwarded-For ή real IP
  const ip = req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'anonymous';

  // Δημιουργία μοναδικού αναγνωριστικού με βάση το IP και το path
  const path = req.nextUrl.pathname;
  const identifier = config.identifier || `${ip}:${path}`;
  
  // Έλεγχος rate limit
  const result = rateLimiter.check(config, identifier);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.max(1, result.reset - Math.floor(Date.now() / 1000)).toString(),
        }
      }
    );
  }
  
  // Αν το rate limiting δεν έχει ξεπεραστεί, επιστρέφουμε headers
  return { 
    success: true, 
    headers: {
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    }
  };
}

// Βοηθητική συνάρτηση για εφαρμογή rate limiting ειδικά για login attempts
export async function loginRateLimit(req: NextRequest): Promise<NextResponse | RateLimitSuccess> {
  const ip = req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'anonymous';
  
  // Αυστηρότερα όρια για τα login attempts - 5 προσπάθειες ανά 5 λεπτά
  const config: RateLimitConfig = { 
    limit: 5, 
    window: 300, // 5 λεπτά
    identifier: `login:${ip}` 
  };
  
  return await rateLimit(req, config);
}

// Γενική συνάρτηση για rate limiting ανά endpoint και IP
export function createEndpointRateLimit(
  endpoint: string,
  limit: number = 60,
  window: number = 60
) {
  return async (req: NextRequest): Promise<NextResponse | RateLimitSuccess> => {
    const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'anonymous';
    
    const config: RateLimitConfig = {
      limit,
      window,
      identifier: `${endpoint}:${ip}`
    };
    
    return await rateLimit(req, config);
  };
}

// Προκαθορισμένα rate limits για συχνά χρησιμοποιούμενα endpoints
export const contactFormRateLimit = createEndpointRateLimit('contact', 5, 600); // 5 αιτήματα ανά 10 λεπτά
export const newsletterRateLimit = createEndpointRateLimit('newsletter', 3, 3600); // 3 αιτήματα ανά ώρα
export const uploadRateLimit = createEndpointRateLimit('upload', 10, 3600); // 10 uploads ανά ώρα