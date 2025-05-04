'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'

const navigation = [
  { name: 'About', href: '#about', ariaLabel: 'Learn about Christos Kerigkas' },
  { name: 'Experience', href: '#experience', ariaLabel: 'View professional experience' },
  { name: 'Skills', href: '#skills', ariaLabel: 'See technical skills' },
  { name: 'Projects', href: '#projects', ariaLabel: 'Explore portfolio projects' },
  { name: 'CV', href: '/cv', ariaLabel: 'View interactive CV' },  
  { name: 'Blog', href: '/blog', ariaLabel: 'Read blog articles' },  
  { name: 'Contact', href: '#contact', ariaLabel: 'Get in touch' },
] as const

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme } = useTheme()

  // Χρήση του useCallback για τη βελτιστοποίηση των event handlers
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)
  }, [])

  useEffect(() => {
    // Debounced scroll event για καλύτερη απόδοση
    let timeoutId: NodeJS.Timeout;
    
    const handleScrollWithDebounce = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };
    
    window.addEventListener('scroll', handleScrollWithDebounce, { passive: true })
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScrollWithDebounce)
    }
  }, [handleScroll])

  // Χρήση useCallback για την αποφυγή περιττών re-renders
  const handleLinkClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  // Χρήση useCallback για το smooth scroll
  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Μόνο για hash links (#)
    if (href.startsWith('#')) {
      e.preventDefault()
      const targetId = href.slice(1)
      const targetElement = document.getElementById(targetId)
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        })
        
        // Ενημέρωση URL χωρίς refresh της σελίδας
        window.history.pushState({}, '', href)
        
        // Κλείσιμο του mobile menu
        setMobileMenuOpen(false)
      }
    }
  }, [])

  const headerClasses = cn(
    'fixed w-full z-50 transition-all duration-200 backdrop-blur-md',
    theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90',
    scrolled && 'shadow-sm'
  )

  const linkClasses = cn(
    'text-sm font-semibold transition-colors duration-200',
    theme === 'dark' 
      ? 'text-gray-400 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900' 
      : 'text-gray-600 hover:text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-white'
  )

  const mobileMenuClasses = cn(
    'block rounded-lg px-3 py-2 text-base font-semibold transition-colors duration-200',
    theme === 'dark'
      ? 'text-gray-400 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white focus:outline-none'
      : 'text-gray-900 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none'
  )

  return (
    <header className={headerClasses} role="banner">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6 lg:px-8" aria-label="Main navigation">
        <div className="flex lg:flex-1">
          <Link 
            href="#" 
            className={cn(
              'text-lg font-bold sm:text-xl transition-colors duration-200',
              theme === 'dark' 
                ? 'text-white hover:text-gray-300 focus:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900' 
                : 'text-gray-900 hover:text-gray-600 focus:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-white'
            )}
            onClick={(e) => handleAnchorClick(e, '#')}
            aria-label="Go to top of page"
          >
            CK
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'rounded-md p-2 transition-colors duration-200',
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white' 
                : 'text-gray-700 hover:text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900'
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={linkClasses}
              onClick={(e) => handleAnchorClick(e, item.href)}
              aria-label={item.ariaLabel}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleAnchorClick(e, item.href)
                    handleLinkClick()
                  }}
                  className={mobileMenuClasses}
                  aria-label={item.ariaLabel}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}