// src/app/api/blog/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { blogRepository } from '@/domains/blog/repositories/blog.repository';
import { handleApiError } from '@/lib/utils/errors/error-handler';

/**
 * Get blog statistics (public)
 * GET /api/blog/statistics
 */
export async function GET(request: NextRequest) {
  try {
    const statistics = await blogRepository.getStatistics();

    // Return public statistics
    return NextResponse.json({
      success: true,
      statistics: {
        totalPublishedPosts: statistics.publishedPosts,
        totalViews: statistics.totalViews,
        avgReadingTime: statistics.avgReadingTime
      }
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}