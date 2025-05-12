// src/components/features/blog/blog-card.tsx
'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { OptimizedImage } from '@/components/common/optimized-image'
import Image from 'next/image'
import { cn, formatDate } from '@/lib/utils/utils'
import type { Post } from '@/types/blog'

interface BlogCardProps {
  post: Post
  index?: number
  variant?: 'card' | 'row'
  className?: string
  theme: 'light' | 'dark' // Διατήρηση του theme ως απαιτούμενο prop
}

/**
 * Ενοποιημένο component για την εμφάνιση blog post σε μορφή κάρτας
 * Υποστηρίζει δύο layouts: card (προεπιλογή) και row
 * Το card είναι κάθετο layout, το row εμφανίζει εικόνα αριστερά και περιεχόμενο δεξιά
 */
export const BlogCard = memo(function BlogCard({ 
  post, 
  index = 0, 
  variant = 'card',
  className,
  theme
}: BlogCardProps) {
  const isCard = variant === 'card'
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        isCard 
          ? "block h-full rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg"
          : "flex flex-col lg:flex-row gap-8 p-6 rounded-lg transition-all duration-200",
        theme === 'dark' 
          ? isCard 
            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
            : 'bg-gray-900/50 hover:bg-gray-900/80'
          : isCard 
            ? 'bg-white hover:bg-gray-50 border border-gray-200'
            : 'bg-gray-50 hover:bg-gray-100',
        className
      )}
    >
      {isCard ? (
        // Card Layout
        <Link href={`/blog/${post.slug}`} className="block">
          <div className="relative aspect-video">
            {/* Χρησιμοποιούμε το Next.js Image για το fill prop */}
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories && post.categories.map((category: string) => (
                <span
                  key={category}
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    theme === 'dark' 
                      ? 'bg-blue-900 text-blue-200' 
                      : 'bg-blue-100 text-blue-800'
                  )}
                >
                  {category}
                </span>
              ))}
            </div>
            
            <h2 className={cn(
              "text-xl font-semibold mb-2 line-clamp-1",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {post.title}
            </h2>
            
            <p className={cn(
              "text-sm mb-4 line-clamp-2",
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            )}>
              {post.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                  <OptimizedImage
                    src={post.authorImage || '/profile.jpg'}
                    alt={post.authorName || 'Author'}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </div>
                <span className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                )}>
                  {post.authorName || post.authorId || 'Author'}
                </span>
              </div>
              
              <span className={cn(
                "text-xs",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                {formatDate(new Date(post.date))}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        // Row Layout
        <>
          <Link href={`/blog/${post.slug}`} className="lg:w-1/3">
            <OptimizedImage
              src={post.image}
              alt={post.title}
              width={400}
              height={250}
              className="rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
            />
          </Link>
          
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <OptimizedImage
                src={post.authorImage || '/profile.jpg'}
                alt={post.authorName || 'Author'}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>{post.authorName || post.authorId || 'Author'}</span>
              <span>•</span>
              <time dateTime={typeof post.date === 'string' ? post.date : post.date?.toString()}>
                {formatDate(new Date(post.date))}
              </time>
            </div>
            
            <Link href={`/blog/${post.slug}`}>
              <h2 className={`mt-4 text-xl font-bold hover:text-indigo-600 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } transition-colors duration-200`}>
                {post.title}
              </h2>
            </Link>
            
            <p className={`mt-2 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {post.description}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {post.categories && post.categories.map((category: string) => (
                <span
                  key={category}
                  className={`text-sm px-3 py-1 rounded-full ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.article>
  )
})

// Default export για συμβατότητα με υπάρχοντα κώδικα
export default BlogCard