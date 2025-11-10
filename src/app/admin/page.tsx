// src/app/admin/page.tsx
'use client'

import { useTheme } from 'next-themes'
import { useAuth } from '@/components/client/providers/auth-provider'
import Link from 'next/link'
import {
  Layout,
  LogOut,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className={cn(
          "flex items-center justify-between py-4 border-b mb-8",
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          <div className="flex items-center space-x-4">
            <Layout className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
            <h1 className={cn(
              "text-xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Admin Dashboard
            </h1>
            {user && (
              <span className={cn(
                "text-sm px-2 py-1 rounded-md",
                theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              )}>
                {user.email}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              View Site
            </Link>

            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark'
                  ? 'text-red-400 hover:text-red-300 hover:bg-gray-800'
                  : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>

        <div className="text-center py-20">
          <h2 className={cn(
            "text-3xl font-bold mb-4",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Welcome to Admin Dashboard
          </h2>
          <p className={cn(
            "text-lg",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          )}>
            Manage your portfolio content and settings
          </p>
        </div>
      </div>
    </div>
  )
}
