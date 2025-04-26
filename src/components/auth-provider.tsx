// src/components/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseAuth, isAuthClientValid } from '@/lib/supabase-auth'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

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
    // Έλεγχος αν το supabaseAuth είναι διαθέσιμο
    if (!isAuthClientValid()) {
      console.warn('AuthProvider: Supabase Auth client is not initialized')
      setIsLoading(false)
      return
    }

    // Αρχικοποίηση της κατάστασης από το τρέχον session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabaseAuth!.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Ακρόαση για αλλαγές στην κατάσταση αυθεντικοποίησης
    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} }
    
    try {
      const { data } = supabaseAuth!.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
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
  }, [])

  // Σύνδεση με email και κωδικό
  const signIn = async (email: string, password: string) => {
    if (!isAuthClientValid()) {
      throw new Error('Authentication system is not available')
    }
    
    const { error } = await supabaseAuth!.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
    
    // Ανανέωση του router
    router.refresh()
  }

  // Αποσύνδεση
  const signOut = async () => {
    if (isAuthClientValid()) {
      await supabaseAuth!.auth.signOut()
    }
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}