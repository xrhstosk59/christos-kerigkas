// /src/lib/api/blog.ts
import { Post, BlogQueryParams, BlogResponse } from '@/types/blog'

/**
 * Get the base URL for API calls
 * Works in both server and client environments
 */
function getBaseUrl() {
  // Server-side: use localhost or NEXT_PUBLIC_API_URL
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  }
  // Client-side: use current origin
  return window.location.origin
}

/**
 * Fetches blog posts with optional filtering and pagination
 */
export async function getBlogPosts(params?: Partial<BlogQueryParams>): Promise<Post[]> {
  try {
    // Build the URL with query parameters
    const searchParams = new URLSearchParams()

    if (params?.category && params.category !== 'all') {
      searchParams.set('category', params.category)
    }

    if (params?.search) {
      searchParams.set('search', params.search)
    }

    if (params?.page) {
      searchParams.set('page', params.page.toString())
    }

    if (params?.postsPerPage) {
      searchParams.set('limit', params.postsPerPage.toString())
    }

    // Fetch from the API with absolute URL
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/blog/search?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Return posts array directly
    return data.posts || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    // Return empty array in case of error
    return []
  }
}

/**
 * Επιστρέφει blog posts με πλήρη απόκριση (posts, categories, pagination)
 */
export async function getBlogPostsWithMeta(params?: Partial<BlogQueryParams>): Promise<BlogResponse> {
  try {
    // Build the URL with query parameters
    const searchParams = new URLSearchParams()
    
    if (params?.category && params.category !== 'all') {
      searchParams.set('category', params.category)
    }
    
    if (params?.search) {
      searchParams.set('search', params.search)
    }
    
    const page = params?.page || 1
    searchParams.set('page', page.toString())
    
    const postsPerPage = params?.postsPerPage || 9
    searchParams.set('limit', postsPerPage.toString())

    // Fetch from the API with absolute URL
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/blog/search?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog posts: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Format the response
    return {
      posts: data.posts || [],
      categories: data.categories || [],
      totalPosts: data.totalPosts || 0,
      pagination: data.pagination ? {
        currentPage: page,
        totalPages: Math.ceil(data.totalPosts / postsPerPage),
        totalPosts: data.totalPosts,
        postsPerPage,
        hasNextPage: page < Math.ceil(data.totalPosts / postsPerPage),
        hasPrevPage: page > 1
      } : null
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    
    // Return empty data in case of error
    return {
      posts: [],
      categories: [],
      totalPosts: 0,
      pagination: null
    }
  }
}

/**
 * Fetches a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(`/api/blog/${slug}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog post: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.post || null
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error)
    return null
  }
}

/**
 * Fetches all blog categories
 */
export async function getBlogCategories(): Promise<string[]> {
  try {
    const response = await fetch('/api/blog/categories')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog categories: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.categories || []
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}