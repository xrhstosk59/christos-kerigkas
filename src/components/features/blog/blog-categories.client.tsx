// src/components/features/blog/blog-categories.client.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'

interface BlogCategoriesClientProps {
  categories: string[]
  selectedCategory?: string
  theme: 'light' | 'dark'
}

/**
 * Client component για την εμφάνιση και επιλογή κατηγοριών blog
 * Χρησιμοποιεί URL parameters για τη διατήρηση της επιλεγμένης κατηγορίας
 */
export function BlogCategoriesClient({ 
  categories, 
  selectedCategory, 
  theme 
}: BlogCategoriesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Χειρισμός επιλογής κατηγορίας
  const handleCategorySelect = (category: string | null) => {
    // Δημιουργία νέων παραμέτρων βάσει των υπαρχουσών
    const params = new URLSearchParams(searchParams.toString())
    
    // Επαναφορά στην πρώτη σελίδα κατά την αλλαγή κατηγορίας
    params.delete('page')
    
    // Αν επιλέχθηκε κατηγορία, την προσθέτουμε στις παραμέτρους
    // Αν επιλέχθηκε "All" (null), αφαιρούμε την παράμετρο category
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    
    // Ενημέρωση του URL
    router.push(`/blog?${params.toString()}`)
  }
  
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        <motion.button
          onClick={() => handleCategorySelect(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            !selectedCategory
              ? theme === 'dark'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-600 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Όλα
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === category
                ? theme === 'dark'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Default export για συμβατότητα με τον υπάρχοντα κώδικα
export default BlogCategoriesClient;