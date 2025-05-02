// src/components/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback, memo } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { isSupabaseUrl } from '@/lib/utils/storage'

// Τύπος για το προφίλ context
type ProfileContextType = { 
  profileImage: string
  setProfileImage: (path: string) => void
  isUploadingImage: boolean
}

const DEFAULT_PROFILE_IMAGE = '/uploads/profile.jpg'

const ProfileContext = createContext<ProfileContextType>({ 
  profileImage: DEFAULT_PROFILE_IMAGE,
  setProfileImage: () => null,
  isUploadingImage: false
})

// Χρήση memo για το ThemeToggleButton για καλύτερη απόδοση
const ThemeToggleButton = memo(() => {
  const { theme, setTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  // Φόρτωση του component μόνο στον client
  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR safe return - καθόλου render στον server
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors duration-200 z-10",
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
          : 'bg-white hover:bg-gray-100 text-gray-900'
      )}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  )
})

ThemeToggleButton.displayName = 'ThemeToggleButton'

// Profile Provider component
function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [profileImage, setProfileImageState] = useState(DEFAULT_PROFILE_IMAGE)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Wrapper για το setProfileImage που διαχειρίζεται την αποθήκευση
  const setProfileImage = useCallback((path: string) => {
    if (!path || path.trim() === '') {
      console.warn('Attempted to set empty profile image path')
      return
    }
    
    // Αποθήκευση του πλήρους URL από το Supabase
    setProfileImageState(path)
    
    // Αν είναι mounted, ενημέρωση του localStorage άμεσα
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('profileImage', path)
    }
  }, [mounted])

  // Αρχικοποίηση από το localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfileImage = localStorage.getItem('profileImage')
      
      if (savedProfileImage) {
        // Έλεγχος εγκυρότητας για Supabase URLs και τοπικά paths
        if (
          (savedProfileImage.startsWith('/') && !savedProfileImage.includes('..')) || 
          isSupabaseUrl(savedProfileImage)
        ) {
          setProfileImageState(savedProfileImage)
        } else {
          console.warn('Invalid profile image path found in localStorage')
          localStorage.removeItem('profileImage')
        }
      }
      
      setMounted(true)
    }
  }, [])

  // SSR safe return
  if (!mounted) {
    return null
  }

  return (
    <ProfileContext.Provider value={{ 
      profileImage, 
      setProfileImage: (path) => {
        setIsUploadingImage(true)
        setProfileImage(path)
        setIsUploadingImage(false)
      },
      isUploadingImage
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

// Ο κύριος ThemeProvider που συνδυάζει next-themes με το profile management
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  // Βεβαιωνόμαστε ότι το component είναι mounted στον client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Απλός placeholder για SSR
    return <>{children}</>
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProfileProvider>
        {children}
        <ThemeToggleButton />
      </ProfileProvider>
    </NextThemesProvider>
  )
}

// Custom hook για χρήση του theme και του profile σε συνδυασμό
export function useTheme() {
  const nextTheme = useNextTheme()
  const profile = useContext(ProfileContext)
  
  return {
    ...nextTheme,
    theme: nextTheme.theme as 'light' | 'dark',
    profileImage: profile.profileImage,
    setProfileImage: profile.setProfileImage,
    isUploadingImage: profile.isUploadingImage
  }
}