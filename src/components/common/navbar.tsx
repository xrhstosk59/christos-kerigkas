'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const navigation = [
  { name: 'About', href: '#about', ariaLabel: 'Learn about Christos Kerigkas' },
  { name: 'Experience', href: '#experience', ariaLabel: 'View professional experience' },
  { name: 'Skills', href: '#skills', ariaLabel: 'See technical skills' },
  { name: 'Projects', href: '#projects', ariaLabel: 'Explore portfolio projects' },
  { name: 'CV', href: '/cv', ariaLabel: 'View interactive CV' },  
  { name: 'Blog', href: '/blog', ariaLabel: 'Read blog articles' },  
  { name: 'Contact', href: '#contact', ariaLabel: 'Get in touch' },
] as const

// ✅ SIMPLE THEME TOGGLE COMPONENT (No heavy theme provider calls)
function SimpleThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="ml-4 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  // ✅ OPTIMIZED SCROLL HANDLER with RAF
  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => {
      setScrolled(window.scrollY > 20)
    })
  }, [])

  useEffect(() => {
    // ✅ PASSIVE SCROLL LISTENER for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // ✅ OPTIMIZED LINK CLICK HANDLER
  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false)
    
    if (href.startsWith('#')) {
      e.preventDefault()
      
      if (pathname === '/') {
        const targetId = href.slice(1)
        const targetElement = document.getElementById(targetId)
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
          
          startTransition(() => {
            window.history.pushState({}, '', href)
          })
        }
      } else {
        startTransition(() => {
          router.push(`/${href}`)
        })
      }
    }
  }, [pathname, router])

  // ✅ OPTIMIZED CSS CLASSES
  const headerClasses = cn(
    'fixed w-full z-50 transition-all duration-300 backdrop-blur-sm',
    scrolled && 'shadow-lg',
    theme === 'dark' 
      ? 'bg-gray-900/95 border-gray-800' 
      : 'bg-white/95 border-gray-200',
    scrolled && 'border-b'
  )

  const linkClasses = cn(
    'text-sm font-medium transition-colors duration-200 hover:scale-105 transform px-3 py-2 rounded-md',
    theme === 'dark' 
      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
  )

  const mobileMenuClasses = cn(
    'block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200',
    theme === 'dark'
      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  )

  return (
    <header className={headerClasses} role="banner">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6 lg:px-8" aria-label="Main navigation">
        {/* ✅ LOGO */}
        <div className="flex lg:flex-1">
          <Link 
            href="/" 
            className={cn(
              'text-xl font-bold transition-all duration-200 hover:scale-110 transform',
              theme === 'dark' 
                ? 'text-white hover:text-gray-300' 
                : 'text-gray-900 hover:text-gray-600'
            )}
            onClick={(e) => pathname === '/' && handleLinkClick(e, '#')}
            aria-label="Go to home page"
          >
            CK
          </Link>
        </div>

        {/* ✅ DESKTOP NAVIGATION */}
        <div className="hidden lg:flex lg:gap-x-8 lg:items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={linkClasses}
              onClick={(e) => handleLinkClick(e, item.href)}
              aria-label={item.ariaLabel}
            >
              {item.name}
            </Link>
          ))}
          <SimpleThemeToggle />
        </div>

        {/* ✅ MOBILE MENU BUTTON */}
        <div className="flex lg:hidden items-center">
          <SimpleThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'ml-2 rounded-md p-2 transition-colors duration-200',
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      
      {/* ✅ MOBILE MENU with CSS transitions only */}
      <div
        id="mobile-menu"
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
          mobileMenuOpen 
            ? 'max-h-96 opacity-100 border-t' 
            : 'max-h-0 opacity-0'
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-4 py-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className={mobileMenuClasses}
              aria-label={item.ariaLabel}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}