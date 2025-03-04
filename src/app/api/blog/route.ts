// src/app/api/blog/route.ts
import { NextResponse } from 'next/server'
import { getBlogPostsByCategory } from '@/lib/supabase'

const POSTS_PER_PAGE = 6

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const category = url.searchParams.get('category') || ''
    
    const { posts, total } = await getBlogPostsByCategory(
      category,
      page,
      POSTS_PER_PAGE
    )
    
    // Υπολογισμός pagination
    const totalPages = Math.ceil(total / POSTS_PER_PAGE)
    
    return NextResponse.json(
      {
        posts,
        pagination: {
          totalPosts: total,
          totalPages,
          currentPage: page,
          postsPerPage: POSTS_PER_PAGE,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}