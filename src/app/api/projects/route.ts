// src/app/api/projects/route.ts
import { z } from 'zod';
import { projectsService } from '@/lib/services/projects-service';
import { apiResponse } from '@/lib/utils/api-response';
import { getCurrentSession } from '@/lib/auth/server-auth';
import { logger } from '@/lib/utils/logger';
import { Role } from '@/lib/auth/access-control';
import { createApiHandler } from '@/lib/utils/api-middleware';

// Project validation schema για δημιουργία/ενημέρωση
const projectSchema = z.object({
  slug: z.string().min(1, 'Το slug είναι υποχρεωτικό')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Το slug πρέπει να περιέχει μόνο πεζά γράμματα, αριθμούς και παύλες'),
  title: z.string().min(1, 'Ο τίτλος είναι υποχρεωτικός').max(100, 'Ο τίτλος είναι πολύ μεγάλος'),
  description: z.string().min(1, 'Η περιγραφή είναι υποχρεωτική'),
  shortDescription: z.string().optional(),
  categories: z.array(z.string()).min(1, 'Επιλέξτε τουλάχιστον μία κατηγορία'),
  tech: z.array(z.string()).min(1, 'Επιλέξτε τουλάχιστον μία τεχνολογία'),
  github: z.string().url('Το GitHub URL πρέπει να είναι έγκυρο URL'),
  demo: z.string().url('Το Demo URL πρέπει να είναι έγκυρο URL').optional(),
  image: z.string().url('Η εικόνα πρέπει να είναι έγκυρο URL'),
  featured: z.boolean().optional(),
});

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req, validData, _context) => {
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
      logger.error('Σφάλμα κατά την ανάκτηση projects:', error, 'api-projects-GET');
      return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ανάκτηση των projects', error);
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
export const POST = createApiHandler(
  projectSchema,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req, validData, _context) => {
    try {
      // Λήψη του τρέχοντος χρήστη
      const session = await getCurrentSession();
      if (!session.user) {
        return apiResponse.unauthorized();
      }
      
      logger.info(`Δημιουργία νέου project: ${validData.title}`, null, 'api-projects-POST');
      
      // Ασφαλέστερη μετατροπή του ρόλου του χρήστη στον τύπο Role του enum
      let userRole: Role;
      
      switch (session.user.role) {
        case 'admin':
          userRole = Role.ADMIN;
          break;
        case 'editor':
          userRole = Role.EDITOR;
          break;
        default:
          userRole = Role.USER;
      }
      
      const newProject = await projectsService.createProject({
        slug: validData.slug,
        title: validData.title,
        description: validData.description,
        shortDescription: validData.shortDescription || null,
        categories: validData.categories,
        tech: validData.tech,
        github: validData.github,
        demo: validData.demo || null,
        image: validData.image,
        featured: validData.featured || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: session.user.id,
        email: session.user.email,
        role: userRole
      });
      
      return apiResponse.success(
        { 
          message: 'Το project δημιουργήθηκε επιτυχώς', 
          project: {
            ...newProject,
            createdAt: newProject.createdAt.toISOString(),
            updatedAt: newProject.updatedAt.toISOString(),
          }
        },
        undefined,
        201
      );
    } catch (error) {
      logger.error('Σφάλμα κατά τη δημιουργία project:', error, 'api-projects-POST');
      
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return apiResponse.unauthorized();
        } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για τη δημιουργία project') {
          return apiResponse.forbidden(error.message);
        }
      }
      
      return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά τη δημιουργία του project', error);
    }
  },
  {
    name: 'POST /api/projects',
    source: 'body',
    requireAuth: true
  }
);