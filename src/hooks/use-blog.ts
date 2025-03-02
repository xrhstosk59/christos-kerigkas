// src/hooks/use-blog.ts
'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BlogPost } from '@/types/blog'

interface PaginationInfo {
  totalPosts: number
  totalPages: number
  currentPage: number
  postsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface BlogResponse {
  posts: BlogPost[]
  pagination: PaginationInfo
}

export function useBlog(initialPage = 1, initialCategory = 'all') {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [page, setPage] = useState(initialPage)
  const [category, setCategory] = useState(initialCategory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const categoryParam = category !== 'all' ? `&category=${category}` : ''
      const response = await fetch(`/api/blog?page=${page}${categoryParam}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      
      const data = await response.json() as BlogResponse
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }, [page, category])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const nextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      setPage(prev => prev + 1)
    }
  }, [pagination])

  const prevPage = useCallback(() => {
    if (pagination?.hasPrevPage) {
      setPage(prev => prev - 1)
    }
  }, [pagination])

  const changeCategory = useCallback((newCategory: string) => {
    setCategory(newCategory)
    setPage(1) // Reset to first page when changing category
  }, [])

  return {
    posts,
    pagination,
    loading,
    error,
    page,
    category,
    nextPage,
    prevPage,
    changeCategory,
    refreshPosts: fetchPosts,
  }
}