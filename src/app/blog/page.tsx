'use client'

import { useTheme } from '@/components/themeprovider'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { OptimizedImage } from '@/components/optimizedimage'
import type { BlogPost } from '@/types/blog'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function BlogPage() {
  const { theme } = useTheme()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Blog
          </h1>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map((post) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex flex-col lg:flex-row gap-8 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
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
                    
                    <p className="mt-2">{post.description}</p>
                    
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
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}