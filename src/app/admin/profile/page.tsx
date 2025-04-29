// src/app/admin/profile/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import { supabaseAuth } from '@/lib/supabase-auth'
import Link from 'next/link'
import { 
  User as UserIcon, 
  ChevronLeft,
  Loader2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function AdminProfile() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Έλεγχος αν τα passwords ταιριάζουν
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Έλεγχος αν το password έχει αρκετό μήκος
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)
      
      // Έλεγχος αν το supabaseAuth είναι διαθέσιμο
      if (!supabaseAuth) {
        throw new Error('Authentication service is not available')
      }
      
      // Χρήση του Supabase Auth API για την αλλαγή κωδικού
      const { error } = await supabaseAuth.auth.updateUser({ 
        password: formData.password 
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Επιτυχής ενημέρωση
      setSuccessMessage('Password has been updated successfully')
      setFormData({
        password: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    // Αν δεν υπάρχει χρήστης, ανακατεύθυνση στη σελίδα σύνδεσης
    router.push('/admin/login')
    return null
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <nav className={cn(
          "flex items-center justify-between py-4 border-b mb-8",
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        )}>
          <div className="flex items-center space-x-4">
            <UserIcon className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
            <h1 className={cn(
              "text-xl font-bold",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              My Profile
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin"
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm",
                theme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
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
        
        <div className={cn(
          "p-6 rounded-lg",
          theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'
        )}>
          <h2 className={cn(
            "text-xl font-semibold mb-6",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className={cn(
                "text-sm font-medium",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Email
              </p>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {user.email}
              </p>
            </div>
            
            <div>
              <p className={cn(
                "text-sm font-medium",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                User ID
              </p>
              <p className={cn(
                "text-sm font-mono",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}>
                {user.id}
              </p>
            </div>
            
            <div>
              <p className={cn(
                "text-sm font-medium",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Role
              </p>
              <div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                )}>
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "mt-6 p-6 rounded-lg",
          theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'
        )}>
          <h2 className={cn(
            "text-xl font-semibold mb-6",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Change Password
          </h2>
          
          {error && (
            <div className="p-3 mb-4 rounded bg-red-500 text-white text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className={cn(
              "p-3 mb-4 rounded text-sm",
              theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
            )}>
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label 
                htmlFor="password"
                className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={cn(
                  "w-full p-2 rounded border",
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                )}
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="confirmPassword"
                className={cn(
                  "block text-sm font-medium mb-1",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={cn(
                  "w-full p-2 rounded border",
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                )}
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}