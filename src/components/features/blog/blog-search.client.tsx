// src/components/features/blog/blog-search.client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface BlogSearchClientProps {
  theme: 'light' | 'dark'
  initialQuery?: string
}

/**
 * Client Component για την αναζήτηση στο blog
 * Υποστηρίζει διατήρηση του query στο URL και καθαρισμό του πεδίου αναζήτησης
 */
export function BlogSearchClient({ theme, initialQuery = '' }: BlogSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Ενημέρωση του searchQuery όταν αλλάζει το initialQuery
  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])
  
  // Χειρισμός της υποβολής της φόρμας αναζήτησης
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Δημιουργία νέων παραμέτρων βάσει των υπαρχουσών
    const params = new URLSearchParams(searchParams.toString())
    
    // Επαναφορά στην πρώτη σελίδα κατά την αναζήτηση
    params.delete('page')
    
    // Αν υπάρχει όρος αναζήτησης, τον προσθέτουμε στις παραμέτρους
    // Αν είναι κενός, αφαιρούμε την παράμετρο search
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    
    // Ενημέρωση του URL
    router.push(`/blog?${params.toString()}`)
  }
  
  // Καθαρισμός του πεδίου αναζήτησης
  const handleClear = () => {
    setSearchQuery('')
    
    // Δημιουργία νέων παραμέτρων βάσει των υπαρχουσών
    const params = new URLSearchParams(searchParams.toString())
    
    // Αφαίρεση του search και επαναφορά στην πρώτη σελίδα
    params.delete('search')
    params.delete('page')
    
    // Ενημέρωση του URL
    router.push(`/blog?${params.toString()}`)
  }
  
  return (
    <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Αναζήτηση άρθρων..."
          className={cn(
            "w-full py-2 pl-10 pr-10 rounded-full border focus:ring-2 focus:ring-indigo-500 outline-none transition-colors",
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          )}
        />
        
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={cn(
            "h-5 w-5",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )} />
        </div>
        
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Καθαρισμός αναζήτησης"
          >
            <X className={cn(
              "h-5 w-5",
              theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
            )} />
          </button>
        )}
      </div>
    </form>
  )
}

// Default export για συμβατότητα με τον υπάρχοντα κώδικα
export default BlogSearchClient;