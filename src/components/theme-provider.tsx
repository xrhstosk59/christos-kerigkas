// src/components/theme-provider.tsx

'use client'

import { createContext, useContext, useEffect, useState, useCallback, memo } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSupabaseUrl } from '@/lib/storage'

type Theme = 'light' | 'dark'
type ThemeContextType = { 
  theme: Theme
  toggleTheme: () => void
  profileImage: string
  setProfileImage: (path: string) => void
  isUploadingImage: boolean
}

const DEFAULT_PROFILE_IMAGE = '/uploads/profile.jpg'

const ThemeContext = createContext<ThemeContextType>({ 
  theme: 'light', 
  toggleTheme: () => null,
  profileImage: DEFAULT_PROFILE_IMAGE,
  setProfileImage: () => null,
  isUploadingImage: false
})

const ThemeToggleButton = memo(({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
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
))

ThemeToggleButton.displayName = 'ThemeToggleButton'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [profileImage, setProfileImageState] = useState(DEFAULT_PROFILE_IMAGE)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Wrapper for setProfileImage to handle persistence
  const setProfileImage = useCallback((path: string) => {
    if (!path || path.trim() === '') {
      console.warn('Attempted to set empty profile image path')
      return
    }
    
    // Αποθήκευση του πλήρους URL από το Supabase
    setProfileImageState(path)
    
    // If mounted, update localStorage immediately
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('profileImage', path)
    }
  }, [mounted])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      if (mounted && typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme)
      }
      return newTheme
    })
  }, [mounted])

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme
      const savedProfileImage = localStorage.getItem('profileImage')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      setTheme(savedTheme || (prefersDark ? 'dark' : 'light'))
      
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

  // Apply theme to document
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme, mounted])

  // SSR safe return
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      profileImage, 
      setProfileImage: (path) => {
        setIsUploadingImage(true)
        setProfileImage(path)
        setIsUploadingImage(false)
      },
      isUploadingImage
    }}>
      {children}
      <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)