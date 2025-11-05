// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginWithSupabase, createClient } from '@/lib/supabase/server';
import { authRateLimit } from '@/lib/utils/rate-limit';
import { 
  checkLoginAttemptAllowed, 
  recordFailedLoginAttempt, 
  recordSuccessfulLogin 
} from '@/lib/auth/lockout';
import { z } from 'zod';

// Σχήμα επικύρωσης για το login request
const loginSchema = z.object({
  email: z.string().email('Μη έγκυρη διεύθυνση email'),
  password: z.string().min(1, 'Ο κωδικός πρόσβασης είναι υποχρεωτικός'),
});

export async function POST(req: NextRequest) {
  try {
    // Λήψη και επικύρωση δεδομένων πρώτα για το email
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Μη έγκυρα δεδομένα φόρμας', 
          errors: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;

    // Έλεγχος account lockout
    const lockoutCheck = await checkLoginAttemptAllowed(email, req);
    if (!lockoutCheck.allowed) {
      return NextResponse.json(
        { 
          error: lockoutCheck.message,
          lockoutMinutes: lockoutCheck.lockoutMinutes,
          isLocked: true
        },
        { status: 423 } // 423 Locked
      );
    }

    // Εφαρμογή rate limiting
    const rateLimitResult = await authRateLimit(req);
    
    // Έλεγχος αν έχει ξεπεραστεί το όριο
    if (!rateLimitResult.success && rateLimitResult.response) {
      await recordFailedLoginAttempt(email, req, { reason: 'Rate limit exceeded' });
      return rateLimitResult.response; // Επιστρέφει 429 Too Many Requests
    }
    
    // Δημιουργία headers για rate limit
    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(rateLimitResult.limit),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
      'X-Login-Attempts-Remaining': String(lockoutCheck.remainingAttempts)
    };
    
    // Προσπάθεια σύνδεσης με Supabase
    const loginResult = await loginWithSupabase(email, password);
    
    if (!loginResult.success) {
      // Καταγραφή αποτυχημένης προσπάθειας
      await recordFailedLoginAttempt(email, req, { 
        reason: loginResult.error || 'Invalid credentials' 
      });
      
      // Έλεγχος αν η επόμενη προσπάθεια θα προκαλέσει lockout
      const updatedLockoutCheck = await checkLoginAttemptAllowed(email, req);
      const willLockout = updatedLockoutCheck.remainingAttempts === 0;
      
      return NextResponse.json(
        { 
          error: loginResult.error || 'Λάθος email ή κωδικός πρόσβασης',
          remainingAttempts: updatedLockoutCheck.remainingAttempts,
          willLockout
        },
        { 
          status: 401,
          headers: {
            ...rateLimitHeaders,
            'X-Login-Attempts-Remaining': String(updatedLockoutCheck.remainingAttempts)
          }
        }
      );
    }
    
    // Επιτυχής σύνδεση - καθαρισμός αποτυχημένων προσπαθειών
    await recordSuccessfulLogin(email, req);
    
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