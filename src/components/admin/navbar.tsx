// src/components/admin/navbar.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'
import { 
  Layout, 
  Menu, 
  X, 
  LogOut,
  User,
  Users,
  FileText,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminNavbar() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  // Αφαιρούμε την αχρησιμοποίητη μεταβλητή router
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Posts', href: '/admin', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ]

  return (
    <header className={cn(
      "fixed w-full z-40 transition-all duration-200 backdrop-blur-md",
      theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90',
      "shadow-sm"
    )}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <Layout className={cn(
                "h-6 w-6 mr-2",
                theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              )} />
              <span className={cn(
                "font-bold text-lg",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Admin
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5",
                    pathname === item.href
                      ? theme === 'dark'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-900'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="flex items-center">
                <span className={cn(
                  "text-sm px-3 py-1 rounded-md mr-2",
                  theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                )}>
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium",
                    theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300 hover:bg-gray-800' 
                      : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "inline-flex items-center justify-center p-2 rounded-md",
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={cn(
            "px-2 pt-2 pb-3 space-y-1 sm:px-3",
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          )}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium",
                  pathname === item.href
                    ? theme === 'dark'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
          
          {user && (
            <div className={cn(
              "px-5 py-3 border-t",
              theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className={cn(
                "text-sm truncate mb-2",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              )}>
                {user.email}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2",
                  theme === 'dark' 
                    ? 'text-red-400 hover:text-red-300 hover:bg-gray-800' 
                    : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
                )}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}