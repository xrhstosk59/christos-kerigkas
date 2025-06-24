// src/components/newsletter.tsx
'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils/utils'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'

export function Newsletter() {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }
    
    setStatus('loading')
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe')
      }
      
      setStatus('success')
      setEmail('')
      
      // Reset success status after 5 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.')
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
    }
  }

  return (
    <div className={cn(
      "rounded-lg p-6 md:p-8",
      theme === 'dark' ? 'bg-gray-900' : 'bg-indigo-50'
    )}>
      <div className="flex items-center gap-3 mb-4">
        <Mail className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
        <h3 className={cn(
          "text-xl font-bold",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Stay Updated
        </h3>
      </div>
      
      <p className={cn(
        "mb-4 text-sm",
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      )}>
        Subscribe to the newsletter to get the latest blog posts and updates about web development, cryptocurrency trading, and more!
      </p>
      
      {status === 'success' ? (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-md",
          theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'
        )}>
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>Thanks for subscribing! You&apos;ll receive updates soon.</p>
        </div>
      ) : status === 'error' ? (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-md",
          theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'
        )}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className={cn(
              "flex-1 px-3 py-2 text-sm border rounded-md",
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
            )}
            required
          />
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md text-white",
              status === 'loading' 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            )}
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default Newsletter