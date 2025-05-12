'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { reportError } from '@/_errors/boundaries/reporting'  // Διόρθωση: αλλαγή από '@/_errors/reporting'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Καταγραφή του σφάλματος σε error reporting service
    reportError(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-red-600 dark:text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Κάτι πήγε στραβά!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Παρουσιάστηκε ένα σφάλμα κατά τη φόρτωση της σελίδας. Η ομάδα μας έχει ειδοποιηθεί και εργάζεται για την επίλυση του προβλήματος.
          </p>
          
          {/* Προαιρετικά εμφανίζουμε το σφάλμα μόνο σε development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded mb-6 w-full overflow-auto text-left">
              <p className="font-mono text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {error.digest && (
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={reset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Δοκιμάστε ξανά
            </button>
            
            <Link 
              href="/"
              className="w-full bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 px-4 rounded-md border border-gray-300 dark:border-gray-600 text-center transition-colors"
            >
              Επιστροφή στην αρχική
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}