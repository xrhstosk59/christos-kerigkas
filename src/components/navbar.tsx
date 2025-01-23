// src/components/navbar.tsx
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme } from './themeprovider'

const navigation = [
  { name: 'About', href: '#about' },
  { name: 'Experience', href: '#experience' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

  const bgClass = theme === 'dark' 
    ? 'bg-gray-950/90 backdrop-blur-md border-b border-gray-800' 
    : 'bg-white/80 backdrop-blur-md'

  return (
    <header className={`fixed w-full z-50 ${bgClass}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Main navigation">
        <div className="flex lg:flex-1">
          <a href="#" className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'
          } transition-colors duration-200`}>
            Christos Kerigkas
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md p-2.5 ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            } transition-colors duration-200`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors duration-200`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className={theme === 'dark' ? 'bg-gray-950' : 'bg-white'}>
          <div className="space-y-1 px-6 pb-3 pt-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    : 'text-gray-900 hover:bg-gray-50'
                } transition-colors duration-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}