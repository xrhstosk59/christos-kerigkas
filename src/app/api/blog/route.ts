// src/app/api/blog/route.ts
import { NextResponse } from 'next/server'
import { getBlogPostsByCategory, supabase } from '@/lib/supabase'
import { checkAuth } from '@/lib/auth'
import { z } from 'zod'

const POSTS_PER_PAGE = 6

// Post validation schema for creating/updating
const postSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  image: z.string().url({ message: 'Image must be a valid URL' }),
  author: z.object({
    name: z.string(),
    image: z.string()
  }),
  categories: z.array(z.string()),
  content: z.string().min(1, 'Content is required')
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const category = url.searchParams.get('category') || ''
    const limit = parseInt(url.searchParams.get('limit') || String(POSTS_PER_PAGE), 10)
    
    const { posts, total } = await getBlogPostsByCategory(
      category,
      page,
      limit
    )
    
    // Υπολογισμός pagination
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json(
      {
        posts,
        pagination: {
          totalPosts: total,
          totalPages,
          currentPage: page,
          postsPerPage: limit,
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

// Create a new blog post
export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    await checkAuth()
    
    // Get and validate post data
    const body = await request.json()
    const validationResult = postSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid post data', errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const postData = validationResult.data
    
    // Insert the post into Supabase
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        slug: postData.slug,
        title: postData.title,
        description: postData.description,
        date: postData.date,
        image: postData.image,
        author_name: postData.author.name,
        author_image: postData.author.image,
        categories: postData.categories,
        content: postData.content
      })
    
    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { message: `Failed to create blog post: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Blog post created successfully', slug: postData.slug },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/blog:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}