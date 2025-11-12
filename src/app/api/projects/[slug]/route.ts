// src/app/api/projects/[slug]/route.ts
import { NextRequest } from 'next/server';
import { projectsService } from '@/lib/services/projects-service';
import { apiResponse } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

/**
 * GET - Ανάκτηση συγκεκριμένου project με βάση το slug.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return apiResponse.badRequest('Το slug είναι υποχρεωτικό');
    }

    const project = await projectsService.getProjectBySlug(slug);
    
    if (!project) {
      return apiResponse.notFound('Το project δεν βρέθηκε');
    }
    
    return apiResponse.success(
      { project },
      undefined,
      200
    );
  } catch (error) {
    logger.error(`Σφάλμα κατά την ανάκτηση project με slug ${(await context.params).slug}:`, error, 'api-project-GET');
    return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ανάκτηση του project', error);
  }
}

// PUT and DELETE endpoints removed - projects managed directly in database or CMS