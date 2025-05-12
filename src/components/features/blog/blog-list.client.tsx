// src/components/features/blog/blog-list.client.tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Post } from '@/types/blog';
import { cn } from '@/lib/utils/utils';
import BlogCard from './blog-card';
import { BlogSearchClient } from './blog-search.client';
import { BlogPaginationClient } from './blog-pagination.client';

interface BlogListClientProps {
  posts: Post[]
  theme: 'light' | 'dark'
  currentPage: number
  totalPages: number
  searchQuery?: string
  selectedCategory?: string
}

/**
 * Client component για την παρουσίαση της λίστας των blog posts
 * Υποστηρίζει κενή κατάσταση, αναζήτηση και pagination
 */
export function BlogListClient({ 
  posts, 
  theme,
  currentPage,
  totalPages,
  searchQuery,
  selectedCategory
}: BlogListClientProps) {
  // Έλεγχος αν πρέπει να εμφανίσουμε μήνυμα "Δεν βρέθηκαν posts"
  const showEmptyMessage = useMemo(() => posts.length === 0, [posts]);
  
  return (
    <div className="space-y-8">
      {/* Αναζήτηση */}
      <BlogSearchClient theme={theme} initialQuery={searchQuery} />
      
      {/* Μήνυμα αν δεν βρέθηκαν posts */}
      {showEmptyMessage ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} size={32} />
          </div>
          <h2 className={cn(
            "text-xl font-medium mb-2",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Δεν βρέθηκαν άρθρα
          </h2>
          <p className={cn(
            "text-base",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {searchQuery 
              ? `Δεν βρέθηκαν άρθρα που να περιέχουν "${searchQuery}"` 
              : selectedCategory 
                ? `Δεν βρέθηκαν άρθρα στην κατηγορία "${selectedCategory}"` 
                : 'Δεν υπάρχουν διαθέσιμα άρθρα'}
          </p>
        </motion.div>
      ) : (
        <>
          {/* Λίστα posts με grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <BlogCard post={post} theme={theme} />
              </motion.div>
            ))}
          </div>
          
          {/* Pagination component - Περνάμε μόνο τα απαραίτητα props */}
          {totalPages > 1 && (
            <BlogPaginationClient
              currentPage={currentPage}
              totalPages={totalPages}
              theme={theme}
            />
          )}
        </>
      )}
    </div>
  );
}

// Default export για συμβατότητα με τον υπάρχοντα κώδικα
export default BlogListClient;