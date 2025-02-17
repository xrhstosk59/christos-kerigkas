// src/components/blog-post-client.tsx
'use client'

import { useTheme } from './themeprovider'
import { useEffect, useState } from 'react'
import { OptimizedImage } from './optimizedimage'
import { motion } from 'framer-motion'
import type { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { Markdown } from './markdown'

interface BlogPostClientProps {
  initialData: BlogPost
}

export default function BlogPostClient({ initialData }: BlogPostClientProps) {
  const { theme } = useTheme()
  const [post, setPost] = useState<BlogPost>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Προαιρετικό: Revalidate των δεδομένων στον client
    const revalidateData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/blog/${initialData.slug}`)
        if (!res.ok) throw new Error('Failed to fetch post')
        const data = await res.json()
        setPost(data)
      } catch (err) {
        console.error('Failed to revalidate post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    revalidateData()
  }, [initialData.slug])

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{error}</p>
      </div>
    )
  }

  return (
    <article className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl lg:max-w-4xl"
        >
          {loading && (
            <div className="absolute top-4 right-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {post.title}
            </h1>

            <div className="mt-6 flex items-center gap-4">
              <OptimizedImage
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {post.author.name}
                </p>
                <time
                  dateTime={post.date}
                  className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                >
                  {formatDate(new Date(post.date))}
                </time>
              </div>
            </div>
          </div>

          <OptimizedImage
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="rounded-lg shadow-lg mb-8"
          />

          <Markdown content={post.content} />

          <div className="mt-8 flex flex-wrap gap-2">
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
        </motion.div>
      </div>
    </article>
  )
}