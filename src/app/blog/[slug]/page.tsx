// src/app/blog/[slug]/page.tsx
'use client'

import { useTheme } from '@/components/themeprovider'
import { useEffect, useState } from 'react'
import { OptimizedImage } from '@/components/optimizedimage'
import { motion } from 'framer-motion'
import type { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { Markdown } from '@/components/markdown'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { theme } = useTheme()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setPost(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch post:', err)
        setLoading(false)
      })
  }, [params.slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Post not found</p>
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
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
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
                className={`text-sm px-3 py-1 rounded-full ${theme === 'dark'
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