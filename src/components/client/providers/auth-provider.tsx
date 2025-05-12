'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import * as clientAuth from '@/lib/auth/client-auth'

// Τύπος για το AuthContext
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
        const currentSession = data.session
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Ακρόαση για αλλαγές στην κατάσταση αυθεντικοποίησης
    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} }
    
    try {
      const client = clientAuth.supabaseAuthClient.getClient()
      const { data } = client.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
          
          // Αποφεύγουμε άμεσο refresh του router κατά τη διάρκεια hydration
          if (typeof window !== 'undefined') {
            // Χρησιμοποιούμε setTimeout για να αποφύγουμε θέματα με το hydration
            setTimeout(() => {
              // Ανανεώνουμε το router μόνο αν αλλάξει η κατάσταση σύνδεσης
              const wasLoggedIn = !!session
              const isLoggedIn = session !== null
              
              if (wasLoggedIn !== isLoggedIn) {
                router.refresh()
              }
            }, 0)
          }
        }
      )
      
      subscription = data.subscription
    } catch (error) {
      console.error('Error setting up auth state change listener:', error)
      setIsLoading(false)
    }

    initializeAuth()

    // Καθαρισμός της συνδρομής όταν αφαιρείται το component
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Σύνδεση με email και κωδικό
  const signIn = async (email: string, password: string) => {
    if (!clientAuth.isAuthClientValid()) {
      throw new Error('Authentication system is not available')
    }
    
    // Χρησιμοποιούμε το API του client auth
    const { error } = await clientAuth.auth.signInWithPassword(email, password)

    if (error) {
      throw error
    }
    
    // Αντί για router.refresh(), που μπορεί να προκαλέσει προβλήματα, 
    // επιτρέπουμε το onAuthStateChange να χειριστεί την ανανέωση
  }

  // Αποσύνδεση
  const signOut = async () => {
    if (clientAuth.isAuthClientValid()) {
      await clientAuth.auth.signOut()
    }
    
    // Χρησιμοποιούμε push αντί για refresh για πιο αξιόπιστη πλοήγηση
    router.push('/admin/login')
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}