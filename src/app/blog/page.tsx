'use client'

import { useTheme } from '@/components/themeprovider'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BlogCard } from '@/components/blogcard'
import type { BlogPost } from '@/types/blog'

export default function BlogPage() {
  const { theme } = useTheme()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setPosts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
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
          ) : posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post, index) => (
                <BlogCard key={post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No blog posts found.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}