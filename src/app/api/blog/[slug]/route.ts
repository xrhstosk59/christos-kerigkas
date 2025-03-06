// src/app/api/blog/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBlogPostBySlug, supabase } from '@/lib/supabase'
import { checkAuth } from '@/lib/auth'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ slug: string }>
}

// Post validation schema for updating
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

// Update a blog post
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Check if user is authenticated
    await checkAuth()
    
    const resolvedParams = await context.params
    const { slug: originalSlug } = resolvedParams
    
    if (!originalSlug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      )
    }
    
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
    
    // Update the post in Supabase
    const { error } = await supabase
      .from('blog_posts')
      .update({
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
      .eq('slug', originalSlug)
    
    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json(
        { message: `Failed to update blog post: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Blog post updated successfully', slug: postData.slug },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PUT /api/blog/[slug]:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// Delete a blog post
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    // Check if user is authenticated
    await checkAuth()
    
    const resolvedParams = await context.params
    const { slug } = resolvedParams
    
    if (!slug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      )
    }
    
    // Delete the post from Supabase
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', slug)
    
    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json(
        { message: `Failed to delete blog post: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/blog/[slug]:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}