// src/app/api/blog/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { BlogPost } from '@/types/blog'

let cachedPosts: BlogPost[] | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
let lastFetched = 0
const POSTS_PER_PAGE = 6

export async function GET(request: Request) {
  try {
    const now = Date.now()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const category = url.searchParams.get('category') || ''
    
    // Use cached posts if available
    if (cachedPosts && now - lastFetched < CACHE_DURATION) {
      return handlePagination(cachedPosts, page, category)
    }

    const postsDirectory = path.join(process.cwd(), 'src/content/posts')
    const files = await fs.readdir(postsDirectory)
    
    const posts = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(postsDirectory, filename)
        const content = await fs.readFile(filePath, 'utf8')
        return JSON.parse(content) as BlogPost
      })
    )

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    cachedPosts = posts
    lastFetched = now

    return handlePagination(posts, page, category)
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

function handlePagination(posts: BlogPost[], page: number, category: string) {
  // Filter by category if specified
  const filteredPosts = category 
    ? posts.filter(post => post.categories.includes(category))
    : posts
  
  // Calculate pagination
  const totalPosts = filteredPosts.length
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(start, end)
  
  return NextResponse.json(
    {
      posts: paginatedPosts,
      pagination: {
        totalPosts,
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
}