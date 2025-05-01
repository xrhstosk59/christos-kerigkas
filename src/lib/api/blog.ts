// /src/lib/blog.ts
import { Post, BlogQueryParams, BlogResponse } from '@/types/blog'

/**
 * Fetches blog posts with optional filtering and pagination
 */
export async function getBlogPosts({
  category,
  search,
  page = 1,
  postsPerPage = 9
}: BlogQueryParams): Promise<BlogResponse> {
  try {
    // Build the URL with query parameters
    const params = new URLSearchParams()
    
    if (category && category !== 'all') {
      params.set('category', category)
    }
    
    if (search) {
      params.set('search', search)
    }
    
    params.set('page', page.toString())
    params.set('limit', postsPerPage.toString())
    
    // Fetch from the API
    const response = await fetch(`/api/blog/search?${params.toString()}`)
    
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
      } : undefined
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    
    // Return empty data in case of error
    return {
      posts: [],
      categories: [],
      totalPosts: 0
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