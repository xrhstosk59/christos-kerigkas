// src/app/api/blog/search/route.ts
import { NextResponse } from 'next/server'
import { blogRepository } from '@/domains/blog/repositories/blog.repository' // Διορθωμένο import path
import { z } from 'zod'
import { createEndpointRateLimit } from '@/lib/utils/rate-limit'
import { BlogPost } from '@/domains/blog/models/blog-post.model' // Εισαγωγή του τύπου BlogPost

// Χρήση του προκαθορισμένου rate limiter για αναζήτηση blog
const blogSearchRateLimit = createEndpointRateLimit('blog-search', 10, 60); // 10 αιτήματα ανά λεπτό

// Search request validation
const searchParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query is too long'),
  limit: z.number().int().min(1).max(20).optional().default(10),
})

export async function GET(request: Request) {
  try {
    // Έλεγχος rate limit - 10 requests per minute per IP
    const rateLimitResult = await blogSearchRateLimit(request);
    
    // Έλεγχος αν το αποτέλεσμα είναι NextResponse (σφάλμα rate limit)
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult; // Επιστρέφει 429 Too Many Requests
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
    const posts = dbPosts.map((post: BlogPost) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      image: post.image,
      author: {
        name: post.author_name,
        image: post.author_image
      },
      categories: post.categories,
      content: post.content
    }))
    
    // Προσθήκη των rate limit headers στην απάντηση
    return NextResponse.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
          ...rateLimitResult.headers
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