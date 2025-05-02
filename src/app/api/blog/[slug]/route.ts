// src/app/api/blog/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { blogRepository } from '@/lib/db/repositories/blog-repository'
import { checkAuth } from '@/lib/auth/auth'
import { z } from 'zod'

// Post validation schema
const postSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime({ message: 'Invalid date format' }),
  image: z.string().url({ message: 'Image must be a valid URL' }),
  author: z.object({
    name: z.string().min(1, 'Author name is required'),
    image: z.string().url({ message: 'Author image must be a valid URL' }),
  }),
  categories: z.array(z.string()),
  content: z.string().min(1, 'Content is required'),
})

// Στο Next.js 15, οι παράμετροι διαδρομής (params) είναι πλέον Promise
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    const post = await blogRepository.findBySlug(slug)
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Μετατροπή από το schema του database στο schema του frontend
    const formattedPost = {
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
    }
    
    return NextResponse.json(formattedPost, {
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

// Ενημέρωση blog post
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Έλεγχος αν ο χρήστης είναι authenticated
    await checkAuth()
    
    const params = await context.params;
    const { slug: originalSlug } = params;
    
    if (!originalSlug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      )
    }
    
    // Λήψη και επικύρωση δεδομένων
    const body = await request.json()
    const validationResult = postSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid post data', errors: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const postData = validationResult.data
    
    // Μετατροπή από το schema του frontend στο schema του database
    const updatedPost = await blogRepository.update(originalSlug, {
      slug: postData.slug,
      title: postData.title,
      description: postData.description,
      date: new Date(postData.date),
      image: postData.image,
      authorName: postData.author.name,
      authorImage: postData.author.image,
      categories: postData.categories,
      content: postData.content,
    })
    
    if (!updatedPost) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Blog post updated successfully', post: updatedPost },
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

// Διαγραφή blog post
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Έλεγχος αν ο χρήστης είναι authenticated
    await checkAuth()
    
    const params = await context.params;
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      )
    }
    
    // Διαγραφή του post
    await blogRepository.delete(slug)
    
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