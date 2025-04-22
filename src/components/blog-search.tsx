// src/components/blog-search.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '@/types/blog'

// Custom debounce function with proper typing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function BlogSearch() {
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Set up click outside listener to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    
    const performSearch = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/blog/search?query=${encodeURIComponent(debouncedQuery)}&limit=5`)
        
        if (!response.ok) {
          throw new Error('Failed to search')
        }
        
        const data = await response.json()
        setResults(data.posts || [])
        setShowResults(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        console.error('Error searching blog posts:', err)
      } finally {
        setLoading(false)
      }
    }
    
    performSearch()
  }, [debouncedQuery])

  const handleClearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={searchRef}>
      <div className={cn(
        "relative flex items-center",
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      )}>
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className={cn(
            "w-full py-2 pl-10 pr-10 border rounded-lg",
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500 placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 placeholder-gray-400'
          )}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true)
            }
          }}
        />
        
        {(query || loading) && (
          <button 
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={handleClearSearch}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {/* Search results dropdown */}
      {showResults && (debouncedQuery || results.length > 0) && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg overflow-hidden z-10",
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        )}>
          {results.length === 0 ? (
            <div className={cn(
              "p-4 text-center",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : error ? (
                <p>Error: {error}</p>
              ) : (
                <p>No results found for &quot;{debouncedQuery}&quot;</p>
              )}
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {results.map((post, index) => (
                <Link 
                  href={`/blog/${post.slug}`} 
                  key={post.slug}
                  onClick={() => setShowResults(false)}
                >
                  <div className={cn(
                    "p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                    index !== results.length - 1 && (
                      theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'
                    )
                  )}>
                    <h3 className={cn(
                      "text-base font-medium truncate",
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {post.title}
                    </h3>
                    <p className={cn(
                      "text-sm truncate mt-1",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {post.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.categories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            theme === 'dark' 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}