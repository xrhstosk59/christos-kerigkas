// src/app/api/blog/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBlogPostBySlug } from '@/lib/supabase'

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

    const post = await getBlogPostBySlug(slug)
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (err) {
    console.error('Unexpected error in blog post route:', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}