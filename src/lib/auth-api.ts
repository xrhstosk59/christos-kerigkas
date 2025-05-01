// src/lib/auth-api.ts
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Τύπος για την απάντηση των λειτουργιών αυθεντικοποίησης
 */
export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Τύπος για τα δεδομένα χρήστη
 */
export interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Ενοποιημένο API αυθεντικοποίησης για το project
 * Παρέχει συναρτήσεις για σύνδεση, αποσύνδεση, και διαχείριση χρηστών
 */
export const authApi = {
  /**
   * Σύνδεση χρήστη με email/password
   * 
   * @param email Email χρήστη
   * @param password Κωδικός πρόσβασης
   * @returns Αποτέλεσμα σύνδεσης με δεδομένα συνεδρίας αν είναι επιτυχής
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Έλεγχος αν ο χρήστης έχει το ρόλο 'admin'
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (!profileData || profileData.role !== 'admin') {
        // Αποσύνδεση αν δεν είναι admin
        await supabase.auth.signOut();
        return { success: false, error: 'Unauthorized: Admin privileges required' };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during login' 
      };
    }
  },
  
  /**
   * Αποσύνδεση χρήστη
   * 
   * @param redirectPath Προαιρετική διαδρομή ανακατεύθυνσης μετά την αποσύνδεση
   */
  async logout(redirectPath: string = '/') {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      
      // Ανανέωση όλων των routes που εξαρτώνται από την αυθεντικοποίηση
      revalidatePath('/', 'layout');
      
      // Ανακατεύθυνση στην αρχική σελίδα ή σε συγκεκριμένη διαδρομή
      redirect(redirectPath);
    } catch (error) {
      console.error('Logout error:', error);
      // Ακόμα και αν υπάρχει σφάλμα, ανακατευθύνουμε τον χρήστη
      redirect(redirectPath);
    }
  },
  
  /**
   * Έλεγχος αν ο χρήστης είναι συνδεδεμένος και επιστροφή των στοιχείων του
   * 
   * @returns Δεδομένα χρήστη ή null αν δεν είναι συνδεδεμένος
   */
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const supabase = await createClient();
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return null;
      }
      
      const userId = sessionData.session.user.id;
      
      // Λήψη επιπλέον πληροφοριών προφίλ από τη βάση δεδομένων
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role, first_name, last_name, avatar_url')
        .eq('user_id', userId)
        .single();
      
      return {
        id: userId,
        email: sessionData.session.user.email || '',
        role: profileData?.role as 'admin' | 'user' || 'user',
        firstName: profileData?.first_name,
        lastName: profileData?.last_name,
        avatarUrl: profileData?.avatar_url
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
  
  /**
   * Έλεγχος αν ο χρήστης είναι admin
   * 
   * @returns true αν ο χρήστης είναι admin
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  },
  
  /**
   * Προστασία διαδρομών που απαιτούν admin πρόσβαση
   * Ανακατευθύνει στη σελίδα login αν ο χρήστης δεν είναι admin
   * 
   * @param redirectTo Διαδρομή ανακατεύθυνσης αν ο χρήστης δεν είναι admin
   */
  async requireAdmin(redirectTo: string = '/admin/login'): Promise<void> {
    const isAdmin = await this.isAdmin();
    
    if (!isAdmin) {
      // Προσθήκη του αρχικού URL ως παράμετρος 'from' για ανακατεύθυνση μετά τη σύνδεση
      const params = new URLSearchParams();
      
      // Αποθήκευση του τρέχοντος path για να επιστρέψει μετά τη σύνδεση
      if (typeof window !== 'undefined') {
        params.set('from', window.location.pathname);
      }
      
      const redirectPath = `${redirectTo}?${params.toString()}`;
      redirect(redirectPath);
    }
  },
  
  /**
   * Δημιουργία νέου χρήστη με email/password
   * Μόνο οι admins μπορούν να δημιουργήσουν νέους χρήστες
   * 
   * @param email Email του νέου χρήστη
   * @param password Κωδικός πρόσβασης
   * @param role Ρόλος χρήστη (προεπιλογή: 'user')
   * @returns Αποτέλεσμα εγγραφής
   */
  async createUser(email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<AuthResult> {
    try {
      // Έλεγχος αν ο τρέχων χρήστης είναι admin
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        return { success: false, error: 'Only administrators can create new users' };
      }
      
      const supabase = await createClient();
      
      // Δημιουργία νέου χρήστη
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Επιβεβαίωση email αυτόματα
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'Failed to create user' };
      }
      
      // Δημιουργία προφίλ για τον νέο χρήστη
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          role
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Προσπάθεια διαγραφής του χρήστη αν απέτυχε η δημιουργία προφίλ
        await supabase.auth.admin.deleteUser(data.user.id);
        return { success: false, error: 'Failed to create user profile' };
      }
      
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during user creation' 
      };
    }
  }
};