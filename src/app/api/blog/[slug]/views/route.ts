// src/app/api/blog/[slug]/views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { blogRepository } from '@/domains/blog/repositories/blog.repository';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { rateLimit } from '@/lib/utils/rate-limit';
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

    // Rate limit: max 3 views per IP per post per hour (prevent spam/bots)
    const rateLimitResult = await rateLimit(
      request,
      {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        message: 'Too many view requests for this post. Please try again later.',
      },
      `blog_view:${slug}` // Custom key per blog post
    );

    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

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