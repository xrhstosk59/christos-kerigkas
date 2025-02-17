// src/components/themeprovider.tsx

'use client'

import { createContext, useContext, useEffect, useState, useCallback, memo } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'
type ThemeContextType = { 
  theme: Theme
  toggleTheme: () => void
  profileImage: string
  setProfileImage: (path: string) => void
}

const ThemeContext = createContext<ThemeContextType>({ 
  theme: 'light', 
  toggleTheme: () => null,
  profileImage: '/profile.jpg',
  setProfileImage: () => null
})

const ThemeToggleButton = memo(({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className={cn(
      "fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors duration-200",
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
  const [profileImage, setProfileImage] = useState('/profile.jpg')

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedProfileImage = localStorage.getItem('profileImage')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'))
    if (savedProfileImage) {
      setProfileImage(savedProfileImage)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      localStorage.setItem('profileImage', profileImage)
      document.documentElement.dataset.theme = theme
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme, profileImage, mounted])

  if (!mounted) return null

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, profileImage, setProfileImage }}>
      {children}
      <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)