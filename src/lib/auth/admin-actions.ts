'use server'

import { createClient } from '@/lib/supabase/server'
import type { User, UserAppMetadata } from '@supabase/supabase-js'

// Δομή δεδομένων χρήστη για ασφαλή επιστροφή στο client
type AdminUser = {
  id: string
  email: string
  created_at: string
  role: string
}

// Ορισμός τύπου για τους χρήστες στο context του Supabase
// Διορθωμένο interface για να είναι συμβατό με το User interface
type SupabaseUser = User & {
  app_metadata: UserAppMetadata & {
    role?: string;
  };
  user_metadata: {
    role?: string;
    [key: string]: unknown;
  };
}

// Δημιουργία χρήστη (ασφαλής λειτουργία server-side)
export async function createUser({ 
  email, 
  password, 
  role = 'admin' 
}: { 
  email: string; 
  password: string; 
  role?: string 
}) {
  try {
    // Δημιουργία του Supabase client με το service role key
    // ΣΗΜΕΙΩΣΗ: Το service role key πρέπει να οριστεί στο .env.local ως SUPABASE_SERVICE_ROLE_KEY
    const supabase = await createClient()
    
    // Έλεγχος αν ο χρήστης που καλεί το API είναι admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser || !isAdmin(currentUser as SupabaseUser)) {
      return { error: 'Unauthorized: Only administrators can create users' }
    }
    
    // Χρήση του admin API για δημιουργία χρήστη
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { role }
    })
    
    if (error) throw error
    
    // Επιστροφή success response
    return { success: true, user: user?.id }
  } catch (error) {
    console.error('Error creating user:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to create user' 
    }
  }
}

// Διαγραφή χρήστη (ασφαλής λειτουργία server-side)
export async function deleteUser(userId: string) {
  try {
    // Δημιουργία του Supabase client με το service role key
    const supabase = await createClient()
    
    // Έλεγχος αν ο χρήστης που καλεί το API είναι admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser || !isAdmin(currentUser as SupabaseUser)) {
      return { error: 'Unauthorized: Only administrators can delete users' }
    }
    
    // Προστασία από διαγραφή του ίδιου του τρέχοντος χρήστη
    if (currentUser.id === userId) {
      return { error: 'Cannot delete your own account' }
    }
    
    // Διαγραφή του χρήστη
    const { error } = await supabase.auth.admin.deleteUser(userId)
    
    if (error) throw error
    
    // Επιστροφή success response
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to delete user' 
    }
  }
}

// Λήψη όλων των admin χρηστών
export async function getAdminUsers() {
  try {
    // Δημιουργία του Supabase client με το service role key
    const supabase = await createClient()
    
    // Έλεγχος αν ο χρήστης που καλεί το API είναι admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser || !isAdmin(currentUser as SupabaseUser)) {
      return { error: 'Unauthorized: Only administrators can view admin users' }
    }
    
    // Λήψη όλων των χρηστών
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    
    if (error) throw error
    
    // Φιλτράρισμα για admin χρήστες και μετατροπή σε ασφαλή μορφή
    const adminUsers: AdminUser[] = users
      .filter((user: SupabaseUser) => {
        const appRole = user.app_metadata?.role;
        const userRole = user.user_metadata?.role;
        return appRole === 'admin' || userRole === 'admin';
      })
      .map((user: SupabaseUser) => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        role: (user.app_metadata?.role || user.user_metadata?.role || 'user') as string
      }));
    
    return { users: adminUsers }
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to fetch admin users',
      users: [] 
    }
  }
}

// Βοηθητική συνάρτηση για έλεγχο admin δικαιωμάτων
function isAdmin(user: SupabaseUser): boolean {
  return user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'
}