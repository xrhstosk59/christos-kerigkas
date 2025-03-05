// src/app/blog/page.tsx
'use client'

import { useTheme } from '@/components/theme-provider'
import { motion } from 'framer-motion'
import { BlogCard } from '@/components/blogcard'
import { BlogCategories } from '@/components/blog-categories'
import { useBlog } from '@/hooks/use-blog'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BlogPage() {
  const { theme } = useTheme()
  const {
    posts,
    pagination,
    loading,
    error,
    category,
    nextPage,
    prevPage,
    changeCategory,
  } = useBlog()

  const allCategories = [
    'Next.js',
    'TypeScript',
    'Web Development',
    'Cryptocurrency',
    'Trading',
    'Programming',
    'Data Analysis'
  ]

  return (
    <div className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <h1 className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl mb-12",
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Blog
          </h1>

          <BlogCategories 
            categories={allCategories} 
            activeCategory={category} 
            onCategoryChange={changeCategory} 
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <p className={cn(
              "text-center py-12",
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            )}>
              {error}
            </p>
          ) : posts.length > 0 ? (
            <>
              <div className="space-y-8 mb-8">
                {posts.map((post, index) => (
                  <BlogCard key={post.slug} post={post} index={index} />
                ))}
              </div>
              
              {pagination && (
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={prevPage}
                    disabled={!pagination.hasPrevPage}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                      pagination.hasPrevPage
                        ? theme === 'dark'
                          ? "text-white hover:bg-gray-800" 
                          : "text-gray-900 hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={nextPage}
                    disabled={!pagination.hasNextPage}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                      pagination.hasNextPage
                        ? theme === 'dark'
                          ? "text-white hover:bg-gray-800" 
                          : "text-gray-900 hover:bg-gray-100"
                        : "opacity-50 cursor-not-allowed",
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className={cn(
              "text-center py-12",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {category === 'all' 
                ? 'Δεν βρέθηκαν blog posts.' 
                : `Δεν βρέθηκαν blog posts στην κατηγορία "${category}".`}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}