'use client'

// /src/components/blog/blog-pagination.tsx
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  theme: 'light' | 'dark'
}

// Client Component για το pagination του blog
export default function BlogPagination({ 
  currentPage, 
  totalPages, 
  theme 
}: BlogPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Αν δεν υπάρχουν σελίδες ή υπάρχει μόνο μία, δεν εμφανίζουμε pagination
  if (totalPages <= 1) return null
  
  // Χειρισμός της αλλαγής σελίδας
  const handlePageChange = (page: number) => {
    // Έλεγχος ορίων σελίδας
    if (page < 1 || page > totalPages) return
    
    // Δημιουργία νέων παραμέτρων βάσει των υπαρχουσών
    const params = new URLSearchParams(searchParams.toString())
    
    // Ενημέρωση της παραμέτρου page
    if (page === 1) {
      // Αν είναι η πρώτη σελίδα, αφαιρούμε την παράμετρο page
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    // Ενημέρωση του URL
    router.push(`/blog?${params.toString()}`)
    
    // Scroll προς τα πάνω
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // Δημιουργία λίστας σελίδων για pagination
  const getPagesList = () => {
    const pages: (number | null)[] = []
    
    // Πάντα προσθέτουμε την πρώτη σελίδα
    pages.push(1)
    
    // Για τις ενδιάμεσες σελίδες
    if (currentPage > 3) pages.push(null) // Προσθήκη ellipsis (...) αν χρειάζεται
    
    // Προσθήκη των σελίδων γύρω από την τρέχουσα
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    
    // Ακόμα ένα ellipsis αν χρειάζεται
    if (currentPage < totalPages - 2) pages.push(null)
    
    // Πάντα προσθέτουμε την τελευταία σελίδα (αν δεν είναι ήδη προστεθειμένη)
    if (totalPages > 1) pages.push(totalPages)
    
    return pages
  }
  
  // Δημιουργία της λίστας σελίδων
  const pagesList = getPagesList()
  
  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      {/* Κουμπί "Προηγούμενη" */}
      <motion.button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "p-2 rounded-md transition-colors",
          currentPage === 1
            ? theme === 'dark'
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : theme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
        whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
        whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>
      
      {/* Σελίδες */}
      {pagesList.map((page, index) => (
        page === null ? (
          // Ellipsis (...)
          <span 
            key={`ellipsis-${index}`}
            className={cn(
              "px-4 py-2",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            ...
          </span>
        ) : (
          // Κουμπί σελίδας
          <motion.button
            key={`page-${page}`}
            onClick={() => handlePageChange(page)}
            className={cn(
              "px-4 py-2 rounded-md transition-colors",
              currentPage === page
                ? theme === 'dark'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {page}
          </motion.button>
        )
      ))}
      
      {/* Κουμπί "Επόμενη" */}
      <motion.button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "p-2 rounded-md transition-colors",
          currentPage === totalPages
            ? theme === 'dark'
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : theme === 'dark'
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
        whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
        whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  )
}