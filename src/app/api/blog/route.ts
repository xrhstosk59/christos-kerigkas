// src/app/api/blog/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { BlogPost } from '@/types/blog'

let cachedPosts: BlogPost[] | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
let lastFetched = 0

export async function GET() {
  try {
    const now = Date.now()
    if (cachedPosts && now - lastFetched < CACHE_DURATION) {
      return NextResponse.json(cachedPosts)
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

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}