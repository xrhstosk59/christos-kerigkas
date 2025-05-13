// src/lib/auth/authorization.ts

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { 
  ForbiddenError, 
  UnauthorizedError 
} from '@/lib/utils/errors/app-error';
import { Role, Permission, checkPermission } from './access-control';
import { logger } from '@/lib/utils/logger';

// Τύπος για τα δεδομένα του χρήστη
export interface UserData {
  id: string;
  email: string;
  role: Role;
}

/**
 * Έλεγχος αυθεντικοποίησης και λήψη δεδομένων χρήστη.
 * Μπορεί να χρησιμοποιηθεί σε RSC (React Server Components) και Server Actions.
 */
export async function requireAuth(): Promise<UserData> {
  const cookieStore = await cookies(); // Προσθήκη του await εδώ
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase environment variables', null, 'auth');
    redirect('/admin/login?error=config_error');
  }
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // Δε χρειάζεται να ορίσουμε cookies κατά τον έλεγχο
        },
        remove() {
          // Δε χρειάζεται να αφαιρέσουμε cookies κατά τον έλεγχο
        },
      },
    }
  );
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    logger.error('Auth session error:', sessionError, 'auth');
    redirect('/admin/login?error=session_error');
  }
  
  if (!session) {
    redirect('/admin/login?error=no_session');
  }
  
  // Λήψη των στοιχείων του χρήστη (συμπεριλαμβανομένου του ρόλου)
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (userError) {
    logger.error('User profile error:', userError, 'auth');
    redirect('/admin/login?error=profile_error');
  }
  
  // Ασφαλής έλεγχος για το εάν υπάρχει userData και ρόλος
  const role = userData && userData.role ? userData.role as Role : Role.USER;
  const email = session.user.email || '';
  
  return {
    id: session.user.id,
    email: email,
    role,
  };
}

/**
 * Έλεγχος αυθεντικοποίησης και δικαιωμάτων.
 * Χρησιμοποιείται σε RSC (React Server Components) και Server Actions.
 * 
 * @param requiredPermissions Τα απαιτούμενα δικαιώματα
 * @returns Τα δεδομένα του χρήστη αν έχει τα απαιτούμενα δικαιώματα
 * @throws {UnauthorizedError|ForbiddenError}
 */
export async function requirePermission(
  requiredPermissions: Permission | Permission[]
): Promise<UserData> {
  try {
    const user = await requireAuth();
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // Έλεγχος όλων των απαιτούμενων δικαιωμάτων
    const hasAllPermissions = permissions.every(permission => 
      // Διόρθωση: Παρέχουμε πλήρες αντικείμενο με τα απαραίτητα πεδία
      checkPermission({ id: user.id, email: user.email, role: user.role }, permission)
    );
    
    if (!hasAllPermissions) {
      throw new ForbiddenError('Δεν έχετε τα απαραίτητα δικαιώματα για αυτήν την ενέργεια');
    }
    
    return user;
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw error;
    }
    
    // Αν το σφάλμα δεν είναι ForbiddenError, θεωρούμε ότι είναι πρόβλημα αυθεντικοποίησης
    throw new UnauthorizedError('Απαιτείται αυθεντικοποίηση για αυτήν την ενέργεια');
  }
}

/**
 * Έλεγχος αν ο χρήστης έχει τα απαιτούμενα δικαιώματα.
 * Για χρήση σε API endpoints.
 */
export function hasPermission(
  user: UserData,
  requiredPermissions: Permission | Permission[]
): boolean {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  return permissions.every(permission => 
    // Διόρθωση: Παρέχουμε πλήρες αντικείμενο με τα απαραίτητα πεδία
    checkPermission({ id: user.id, email: user.email, role: user.role }, permission)
  );
}