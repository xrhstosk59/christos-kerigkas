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

interface UseBlogOptions {
  initialPage?: number;
  initialLimit?: number;
  initialCategory?: string;
}

export function useBlog(options: UseBlogOptions = {}) {
  const { 
    initialPage = 1, 
    initialLimit = 10,
    initialCategory = 'all'
  } = options;

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
      const response = await fetch(`/api/blog?page=${page}&limit=${initialLimit}${categoryParam}`)
      
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
  }, [page, category, initialLimit])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // *** Επιπλέον συναρτήσεις για συμβατότητα με το blog-list-client ***
  
  // Για μετάβαση σε συγκεκριμένη σελίδα
  const goToPage = useCallback((pageNumber: number) => {
    if (pagination && pageNumber >= 1 && pageNumber <= pagination.totalPages) {
      setPage(pageNumber);
    }
  }, [pagination]);

  // Για καθαρισμό των φίλτρων
  const clearFilters = useCallback(() => {
    setCategory('all');
    setPage(1);
  }, []);

  // Οι υπάρχουσες συναρτήσεις
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
    // Προσθήκη των νέων συναρτήσεων
    goToPage,
    setCategory,
    clearFilters,
    // Υπάρχουσες συναρτήσεις
    nextPage,
    prevPage,
    changeCategory,
    refreshPosts: fetchPosts,
  }
}