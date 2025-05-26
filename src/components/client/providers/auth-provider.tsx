// src/components/client/providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase/client'

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

// Τύπος για partial session object
interface PartialSession {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
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

  // Helper function για δημιουργία session object
  const createSessionObject = useCallback((user: User): Session => {
    const partialSession: PartialSession = {
      user,
      access_token: '',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: ''
    }
    return partialSession as Session
  }, [])

  // Ανανέωση της συνεδρίας
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const { user } = await supabaseClient.auth.getCurrentUser()
      
      if (user) {
        // Δημιουργία session object από το user
        const sessionObject = createSessionObject(user)
        updateAuthState(sessionObject)
      } else {
        updateAuthState(null)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      updateAuthState(null)
    } finally {
      setIsLoading(false)
    }
  }, [updateAuthState, createSessionObject])

  // Αρχικοποίηση και event listeners
  useEffect(() => {
    // Αρχικοποίηση της κατάστασης από το τρέχον session
    const initializeAuth = async () => {
      try {
        const { user } = await supabaseClient.auth.getCurrentUser()
        
        if (user) {
          // Δημιουργία session object από το user
          const sessionObject = createSessionObject(user)
          updateAuthState(sessionObject)
        } else {
          updateAuthState(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        updateAuthState(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Ακρόαση για αλλαγές στην κατάσταση αυθεντικοποίησης
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
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
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router, updateAuthState, refreshSession, createSessionObject])

  // Βελτιωμένος χειρισμός σύνδεσης χρήστη με καλύτερο error handling
  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabaseClient.auth.signIn(email, password)

      if ('error' in result && result.error) {
        return { success: false, error: result.error }
      }
      
      // Ενημέρωση του auth state με τη νέα συνεδρία
      if ('data' in result && result.data) {
        // Δημιουργία session object από το user
        const user = result.data.user
        if (user) {
          const sessionObject = createSessionObject(user)
          updateAuthState(sessionObject)
        }
      }
      
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
    try {
      await supabaseClient.auth.signOut()
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