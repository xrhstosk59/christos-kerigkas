'use client'

// /src/components/blog/blog-list.tsx
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Post } from '@/types/blog'
import { cn } from '@/lib/utils'
import BlogCard from './blog-card'
import BlogSearch from './blog-search'
import BlogPagination from './blog-pagination'

interface BlogListProps {
  posts: Post[]
  theme: 'light' | 'dark'
  currentPage: number
  totalPages: number
  searchQuery?: string
  selectedCategory?: string
}

// Client Component για τη λίστα του blog
export default function BlogList({ 
  posts, 
  theme,
  currentPage,
  totalPages,
  searchQuery,
  selectedCategory
}: BlogListProps) {
  // Έλεγχος αν πρέπει να εμφανίσουμε μήνυμα "Δεν βρέθηκαν posts"
  const showEmptyMessage = posts.length === 0;
  
  return (
    <div>
      {/* Αναζήτηση - Client Component */}
      <BlogSearch theme={theme} initialQuery={searchQuery} />
      
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
            No posts found
          </h2>
          <p className={cn(
            "text-base",
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {searchQuery 
              ? `No posts match "${searchQuery}"` 
              : selectedCategory 
                ? `No posts in "${selectedCategory}" category` 
                : 'There are no blog posts available'}
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
          
          {/* Pagination component */}
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            theme={theme}
          />
        </>
      )}
    </div>
  )
}