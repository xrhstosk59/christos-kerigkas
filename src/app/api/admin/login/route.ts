// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginWithSupabase } from '@/lib/auth/supabase-auth';
import { loginRateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

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
    const rateLimitResult = await loginRateLimit(req);
    
    // Έλεγχος αν το αποτέλεσμα είναι NextResponse (σφάλμα rate limit)
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult; // Επιστρέφει 429 Too Many Requests
    }
    
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
          headers: rateLimitResult.headers
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
          headers: rateLimitResult.headers
        }
      );
    }
    
    // Επιτυχής σύνδεση - Το Supabase ήδη έχει ορίσει τα cookies
    return NextResponse.json(
      { success: true, message: 'Επιτυχής σύνδεση' },
      { 
        status: 200,
        headers: rateLimitResult.headers
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
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            cookie: req.headers.get('cookie') || ''
          }
        }
      }
    );
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
    
    return NextResponse.json({ isAuthenticated: true }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}