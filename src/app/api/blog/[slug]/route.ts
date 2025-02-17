// src/app/api/blog/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { BlogPost } from '@/types/blog'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const resolvedParams = await context.params
    const { slug } = resolvedParams

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'src/content/posts', `${slug}.json`)
    
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const post = JSON.parse(content) as BlogPost
      
      return NextResponse.json(post, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      })
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json(
          { message: 'Post not found' },
          { status: 404 }
        )
      }
      
      console.error('Error reading blog post:', err)
      return NextResponse.json(
        { message: 'Error reading blog post' },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Unexpected error in blog post route:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}