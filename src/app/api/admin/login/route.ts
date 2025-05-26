// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginWithSupabase, createClient } from '@/lib/supabase/server';
import { authRateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';

// Σχήμα επικύρωσης για το login request
const loginSchema = z.object({
  email: z.string().email('Μη έγκυρη διεύθυνση email'),
  password: z.string().min(1, 'Ο κωδικός πρόσβασης είναι υποχρεωτικός'),
});

// Συνάρτηση για την καταγραφή αποτυχημένων προσπαθειών login
async function logFailedLoginAttempt(req: NextRequest, email: string, reason: string) {
  const ip = req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'unknown';
  
  // Σε παραγωγικό περιβάλλον, θα μπορούσαμε να αποθηκεύσουμε αυτά τα logs
  if (process.env.NODE_ENV === 'production') {
    console.error(`Αποτυχημένη προσπάθεια login: ${email} από IP ${ip} - Λόγος: ${reason}`);
    // Εδώ θα μπορούσαμε να προσθέσουμε κώδικα για αποθήκευση σε βάση δεδομένων
  } else {
    console.warn(`[DEV] Αποτυχημένη προσπάθεια login: ${email} από IP ${ip} - Λόγος: ${reason}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Εφαρμογή rate limiting
    const rateLimitResult = await authRateLimit(req);
    
    // Έλεγχος αν έχει ξεπεραστεί το όριο
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response; // Επιστρέφει 429 Too Many Requests
    }
    
    // Δημιουργία headers για rate limit
    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(rateLimitResult.limit),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000))
    };
    
    // Λήψη και επικύρωση δεδομένων
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      await logFailedLoginAttempt(req, body.email || 'unknown', 'Μη έγκυρα δεδομένα φόρμας');
      
      return NextResponse.json(
        { 
          error: 'Μη έγκυρα δεδομένα φόρμας', 
          errors: validationResult.error.flatten() 
        },
        { 
          status: 400,
          headers: rateLimitHeaders
        }
      );
    }
    
    const { email, password } = validationResult.data;
    
    // Προσπάθεια σύνδεσης με Supabase
    const loginResult = await loginWithSupabase(email, password);
    
    if (!loginResult.success) {
      await logFailedLoginAttempt(req, email, loginResult.error || 'Αποτυχία σύνδεσης');
      
      return NextResponse.json(
        { error: loginResult.error || 'Λάθος email ή κωδικός πρόσβασης' },
        { 
          status: 401,
          headers: rateLimitHeaders
        }
      );
    }
    
    // Επιτυχής σύνδεση - Το Supabase ήδη έχει ορίσει τα cookies
    return NextResponse.json(
      { success: true, message: 'Επιτυχής σύνδεση' },
      { 
        status: 200,
        headers: rateLimitHeaders
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'Παρουσιάστηκε απροσδόκητο σφάλμα' },
      { status: 500 }
    );
  }
}

// Για έλεγχο της κατάστασης σύνδεσης
export async function GET(_req: NextRequest) {
  try {
    // Ασφαλής έλεγχος environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
    
    // Χρήση του server createClient για consistency
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
    
    return NextResponse.json({ 
      isAuthenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}