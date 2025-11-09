// src/app/api/blog/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { blogRepository } from '@/domains/blog/repositories/blog.repository';
import { handleApiError } from '@/lib/utils/errors/error-handler';
import { checkAdminAuth } from '@/lib/auth/admin-auth';

/**
 * Get blog statistics
 * GET /api/blog/statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated admin for detailed stats
    const authResult = await checkAdminAuth(request);
    const isAdmin = authResult.isAuthenticated && authResult.user;

    const statistics = await blogRepository.getStatistics();
    
    if (isAdmin) {
      // Return detailed statistics for admin
      const popularPosts = await blogRepository.findMostPopular(5);
      
      return NextResponse.json({
        success: true,
        statistics,
        popularPosts: popularPosts.map(post => ({
          slug: post.slug,
          title: post.title,
          views: post.views,
          readingTime: post.reading_time,
          date: post.date
        }))
      });
    } else {
      // Return limited statistics for public
      return NextResponse.json({
        success: true,
        statistics: {
          totalPublishedPosts: statistics.publishedPosts,
          totalViews: statistics.totalViews,
          avgReadingTime: statistics.avgReadingTime
        }
      });
    }

  } catch (error) {
    return handleApiError(error, request);
  }
}