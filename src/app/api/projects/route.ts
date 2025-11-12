// src/app/api/projects/route.ts
import { z } from 'zod';
import { projectsService } from '@/lib/services/projects-service';
import { apiResponse } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';
import { createApiHandler } from '@/lib/utils/api-middleware';
import { NotFoundError } from '@/lib/utils/api-error';

// Search schema για επικύρωση παραμέτρων αναζήτησης
const searchParamsSchema = z.object({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  sortBy: z.enum(['order', 'title']).optional().default('order'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET - Ανάκτηση projects με δυνατότητα φιλτραρίσματος.
 */
export const GET = createApiHandler(
  searchParamsSchema,
  async (_req, validData) => {
    try {
      logger.info(`Αναζήτηση projects`, validData, 'api-projects-GET');

      // Εκτέλεση της αναζήτησης με το service
      const result = await projectsService.getProjects(validData);

      // Κατάλληλο format της απάντησης
      const response = apiResponse.success(
        { projects: result.projects },
        { totalProjects: result.total }
      );

      // Προσθήκη cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

      return response;
    } catch (error) {
      // Ελέγχουμε για συγκεκριμένα σφάλματα και τα μετατρέπουμε σε αντίστοιχες αποκρίσεις
      if (error instanceof NotFoundError) {
        return apiResponse.notFound(error.message);
      }
      
      // Άλλα σφάλματα θα πιαστούν από το error handling middleware
      throw error;
    }
  },
  {
    name: 'GET /api/projects',
    source: 'query',
    requireAuth: false // Το GET endpoint είναι δημόσιο
  }
);

/**
 * POST - Δημιουργία νέου project.
 */
// POST endpoint removed - projects are managed directly in database or via CMS
