// src/app/api/blog/[slug]/views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { blogRepository } from '@/domains/blog/repositories/blog.repository';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { z } from 'zod';

const viewRequestSchema = z.object({
  slug: z.string().min(1),
});

/**
 * Increment view count for a blog post
 * POST /api/blog/[slug]/views
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const validation = viewRequestSchema.safeParse(resolvedParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }

    const { slug } = validation.data;

    // Get client IP for basic rate limiting (prevent spam)
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Check if this IP has viewed this post recently (basic spam prevention)
    // In a production environment, you might want to use Redis for this
    const _rateLimitKey = `view_${slug}_${clientIP}`;
    
    // For now, we'll just increment the view count
    // TODO: Implement proper rate limiting with Redis
    
    const updatedPost = await blogRepository.incrementViews(slug);
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: updatedPost.views,
      message: 'View count incremented'
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * Get view count for a blog post
 * GET /api/blog/[slug]/views
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const validation = viewRequestSchema.safeParse(resolvedParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }

    const { slug } = validation.data;

    const post = await blogRepository.findBySlug(slug);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: post.views || 0,
      slug: post.slug,
      title: post.title
    });

  } catch (error) {
    return handleApiError(error, request);
  }
}