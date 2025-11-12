// src/app/api/blog/route.ts

import { z } from 'zod';
import { apiResponse } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';
import { createApiHandler } from '@/lib/utils/api-middleware';
import { BlogPost } from '@/domains/blog/models/blog-post.model';

// Αλλαγή του import path για να δείχνει στο νέο domains folder
import { blogService } from '@/domains/blog/services';

// Search schema για επικύρωση παραμέτρων αναζήτησης
const searchParamsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['date', 'title']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET - Ανάκτηση blog posts με δυνατότητα αναζήτησης και φιλτραρίσματος.
 */
export const GET = createApiHandler(
  searchParamsSchema,
  async (_req, validData, _context) => {
    try {
      logger.info(`Αναζήτηση blog posts`, validData, 'api-blog-GET');

      // Εκτέλεση της αναζήτησης απευθείας με το blog service
      const result = await blogService.searchPosts(validData);

      // Κατάλληλο format της απάντησης
      const response = apiResponse.success(
        {
          posts: result.posts.map((post: BlogPost) => ({
            slug: post.slug,
            title: post.title,
            description: post.description,
            date: post.date,
            image: post.image,
            author: {
              name: post.author_name,
              image: post.author_image
            },
            categories: post.categories,
            content: post.content,
          })),
        },
        {
          totalPosts: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          postsPerPage: validData.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        }
      );

      // Προσθήκη cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

      return response;
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση blog posts:', error, 'api-blog-GET');
      return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ανάκτηση των blog posts', error);
    }
  },
  {
    name: 'GET /api/blog',
    source: 'query',
    requireAuth: false // Το GET endpoint είναι δημόσιο
  }
);

// POST endpoint removed - blog posts are managed directly in database or via CMS