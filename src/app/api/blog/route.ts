// src/app/api/blog/route.ts
import { NextResponse } from 'next/server'
import { blogRepository } from '@/lib/db/repositories/blog-repository'
import { checkAuth } from '@/lib/auth'
import { z } from 'zod'

const POSTS_PER_PAGE = 6

// Post validation schema για δημιουργία/ενημέρωση
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const category = url.searchParams.get('category') || ''
    const limit = parseInt(url.searchParams.get('limit') || String(POSTS_PER_PAGE), 10)
    
    let result
    
    if (category && category !== 'all') {
      result = await blogRepository.findByCategory(category, page, limit)
    } else {
      result = await blogRepository.findAll(page, limit)
    }
    
    // Μετατροπή των posts στο format του frontend
    const posts = result.posts.map(post => ({
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
      {
        posts,
        pagination: {
          totalPosts: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          postsPerPage: limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
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

// Δημιουργία νέου blog post
export async function POST(request: Request) {
  try {
    // Έλεγχος αν ο χρήστης είναι authenticated
    await checkAuth()
    
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
    const newPost = await blogRepository.create({
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
    
    return NextResponse.json(
      { message: 'Blog post created successfully', post: newPost },
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