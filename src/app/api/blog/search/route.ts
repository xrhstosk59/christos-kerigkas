// src/app/api/blog/search/route.ts
import { NextResponse } from 'next/server'
import { blogRepository } from '@/lib/db/repositories/blog-repository'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

// Create limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 10,
})

// Search request validation
const searchParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query is too long'),
  limit: z.number().int().min(1).max(20).optional().default(10),
})

export async function GET(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit - 10 requests per minute per IP
    try {
      await limiter.check(10, `BLOG_SEARCH_${ip}`)
    } catch {
      return NextResponse.json(
        { message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    // Parse search parameters
    const url = new URL(request.url)
    const query = url.searchParams.get('query') || ''
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)
    
    // Validate parameters
    const validationResult = searchParamsSchema.safeParse({ query, limit })
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid search parameters', errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const { query: validatedQuery, limit: validatedLimit } = validationResult.data
    
    // Perform search using repository
    const dbPosts = await blogRepository.search(validatedQuery, validatedLimit)
    
    // Μετατροπή από το schema του database στο schema του frontend
    const posts = dbPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date.toISOString(),
      image: post.image,
      author: {
        name: post.authorName,
        image: post.authorImage
      },
      categories: post.categories,
      content: post.content
    }))
    
    return NextResponse.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Failed to search blog posts:', error)
    return NextResponse.json(
      { message: 'Failed to search blog posts' },
      { status: 500 }
    )
  }
}