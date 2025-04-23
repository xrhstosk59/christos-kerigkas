// src/components/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseAuth } from '@/lib/supabase-auth'
import { Session, User } from '@supabase/supabase-js'
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
    // Αρχικοποίηση της κατάστασης από το τρέχον session
    const initializeAuth = async () => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    // Ακρόαση για αλλαγές στην κατάσταση αυθεντικοποίησης
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    initializeAuth()

    // Καθαρισμός της συνδρομής όταν αφαιρείται το component
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Σύνδεση με email και κωδικό
  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseAuth.auth.signInWithPassword({
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
    await supabaseAuth.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}