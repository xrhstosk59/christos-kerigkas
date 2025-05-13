'use client'

import { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import * as clientAuth from '@/lib/auth/client-auth'

// Τύπος για το AuthContext με βελτιωμένο type safety
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Default values για το context
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({ success: false, error: new Error('Auth provider not initialized') }),
  signOut: async () => {},
  refreshSession: async () => {}
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

// Hook για εύκολη πρόσβαση στο AuthContext
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // useTransition για πιο ομαλές μεταβάσεις UI με React 19
  const [, startTransition] = useTransition()

  // Βελτιωμένη ενημέρωση της κατάστασης αυθεντικοποίησης
  const updateAuthState = useCallback((newSession: Session | null) => {
    setSession(newSession)
    setUser(newSession?.user ?? null)
  }, [])

  // Ανανέωση της συνεδρίας
  const refreshSession = useCallback(async () => {
    if (!clientAuth.isAuthClientValid()) {
      return
    }

    try {
      setIsLoading(true)
      const { data } = await clientAuth.auth.getSession()
      updateAuthState(data.session)
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [updateAuthState])

  // Αρχικοποίηση και event listeners
  useEffect(() => {
    // Έλεγχος αν το Supabase client είναι διαθέσιμο
    if (!clientAuth.isAuthClientValid()) {
      console.warn('AuthProvider: Supabase Auth client is not initialized')
      setIsLoading(false)
      return
    }

    // Αρχικοποίηση της κατάστασης από το τρέχον session
    const initializeAuth = async () => {
      try {
        const { data } = await clientAuth.auth.getSession()
        updateAuthState(data.session)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Ακρόαση για αλλαγές στην κατάσταση αυθεντικοποίησης
    // Βελτιωμένο cleanup με unsubscribe type safety
    let unsubscribe: () => void = () => {}
    
    try {
      const client = clientAuth.supabaseAuthClient.getClient()
      const { data } = client.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          updateAuthState(session)
          
          // Βελτιωμένος χειρισμός UI μεταβάσεων με React 19 transitions
          startTransition(() => {
            // Χρήση του router για ανανέωση μετά από αλλαγές στην κατάσταση σύνδεσης
            if (event === 'SIGNED_IN') {
              router.refresh()
            } else if (event === 'SIGNED_OUT') {
              router.refresh()
            }
          })
        }
      )
      
      unsubscribe = data.subscription.unsubscribe
    } catch (error) {
      console.error('Error setting up auth state change listener:', error)
      setIsLoading(false)
    }

    // Εκτέλεση της αρχικοποίησης
    initializeAuth()

    // Προσθήκη window event listener για ανανέωση του session μετά από 
    // επιστροφή της καρτέλας στο προσκήνιο (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Καθαρισμός των event listeners
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router, updateAuthState, refreshSession])

  // Βελτιωμένος χειρισμός σύνδεσης χρήστη με καλύτερο error handling
  const signIn = async (email: string, password: string) => {
    if (!clientAuth.isAuthClientValid()) {
      return { 
        success: false, 
        error: new Error('Authentication system is not available') 
      }
    }
    
    try {
      // Χρησιμοποιούμε το API του client auth
      const result = await clientAuth.auth.signInWithPassword(email, password)

      if (result.error) {
        return { success: false, error: result.error }
      }
      
      // Ενημέρωση του auth state με τη νέα συνεδρία
      updateAuthState(result.data?.session || null)
      
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('An unknown error occurred during sign in') 
      }
    }
  }

  // Βελτιωμένος χειρισμός αποσύνδεσης
  const signOut = async () => {
    if (!clientAuth.isAuthClientValid()) {
      return
    }
    
    try {
      await clientAuth.auth.signOut()
      // Καθαρισμός της τοπικής κατάστασης
      updateAuthState(null)
      
      // Βελτιωμένη πλοήγηση μετά την αποσύνδεση
      startTransition(() => {
        router.push('/admin/login')
      })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Υπολογισμός του isAuthenticated βάσει της ύπαρξης user
  const isAuthenticated = !!user

  // Δημιουργία του context value
  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}