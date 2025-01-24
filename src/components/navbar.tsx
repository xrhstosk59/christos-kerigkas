'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme } from './themeprovider'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Blog', href: '/blog' },  
  { name: 'Contact', href: '#contact' },
] as const

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClasses = cn(
    'fixed w-full z-50 transition-all duration-200 backdrop-blur-md',
    theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90',
    scrolled && 'shadow-sm'
  )

  const linkClasses = cn(
    'text-sm font-semibold transition-colors duration-200',
    theme === 'dark' 
      ? 'text-gray-400 hover:text-white' 
      : 'text-gray-600 hover:text-gray-900'
  )

  const mobileMenuClasses = cn(
    'block rounded-lg px-3 py-2 text-base font-semibold transition-colors duration-200',
    theme === 'dark'
      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
      : 'text-gray-900 hover:bg-gray-50'
  )

  return (
    <header className={headerClasses}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a 
            href="#" 
            className={cn(
              'text-lg font-bold sm:text-xl transition-colors duration-200',
              theme === 'dark' 
                ? 'text-white hover:text-gray-300' 
                : 'text-gray-900 hover:text-gray-600'
            )}
          >
            CK
          </a>
        </div>

        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'rounded-md p-2 transition-colors duration-200',
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-700 hover:text-gray-900'
            )}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={linkClasses}
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileMenuClasses}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}