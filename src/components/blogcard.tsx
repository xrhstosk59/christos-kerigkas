'use client'

import { useTheme } from './themeprovider'
import { motion } from 'framer-motion'
import { OptimizedImage } from './optimizedimage'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'

interface BlogCardProps {
  post: BlogPost
  index: number
}

export function BlogCard({ post, index }: BlogCardProps) {
  const { theme } = useTheme()
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex flex-col lg:flex-row gap-8 p-6 rounded-lg ${
        theme === 'dark' 
          ? 'bg-gray-900/50 hover:bg-gray-900/80' 
          : 'bg-gray-50 hover:bg-gray-100'
      } transition-all duration-200`}
    >
      <div className="lg:w-1/3">
        <OptimizedImage
          src={post.image}
          alt={post.title}
          width={400}
          height={250}
          className="rounded-lg shadow-md"
        />
      </div>
      
      <div className="lg:w-2/3">
        <div className="flex items-center gap-2 text-sm">
          <OptimizedImage
            src={post.author.image}
            alt={post.author.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span>{post.author.name}</span>
          <span>•</span>
          <time dateTime={post.date}>{formatDate(new Date(post.date))}</time>
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h2 className={`mt-4 text-xl font-bold ${
            theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'
          } transition-colors duration-200`}>
            {post.title}
          </h2>
        </Link>
        
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {post.description}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {post.categories.map((category) => (
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
    </motion.article>
  )
}