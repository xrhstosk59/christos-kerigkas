// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Login failed. Please try again.')
        return
      }

      // Redirect to admin dashboard
      router.push('/admin')
      router.refresh()
    } catch (error) {
      setStatus('error')
      setErrorMessage('An unexpected error occurred. Please try again later.')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className={cn(
        "w-full max-w-md p-8 rounded-lg shadow-md",
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      )}>
        <h1 className={cn(
          "text-2xl font-bold text-center mb-6",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Admin Login
        </h1>
        
        {status === 'error' && (
          <div className="mb-4 p-3 text-sm text-white bg-red-500 rounded">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="username" 
              className={cn(
                "block text-sm font-medium mb-1", 
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={cn(
                "w-full px-3 py-2 border rounded-md",
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
              )}
              required
            />
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className={cn(
                "block text-sm font-medium mb-1", 
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={cn(
                "w-full px-3 py-2 border rounded-md",
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
              )}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              "w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center",
              status === 'loading' 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            )}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}