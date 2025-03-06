// src/app/admin/posts/edit/[slug]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import BlogPostForm from '@/components/admin/blog-post-form'
import { Loader2 } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'

export default function EditBlogPostPage() {
  const params = useParams<{ slug: string }>()
  const { theme } = useTheme()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/blog/${params.slug}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog post')
        }
        
        const data = await response.json()
        setPost(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post')
        console.error('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchPost()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className={cn(
            "p-8 rounded-lg text-center",
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          )}>
            <h2 className={cn(
              "text-2xl font-bold mb-2",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Post Not Found
            </h2>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {error || "The blog post you're trying to edit doesn't exist or couldn't be loaded."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <BlogPostForm initialData={post} isEditing={true} />
}