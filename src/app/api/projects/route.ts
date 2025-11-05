// src/app/api/projects/route.ts
import { z } from 'zod';
import { projectsService } from '@/lib/services/projects-service';
import { apiResponse } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';
import { Role } from '@/lib/auth/access-control';
import { createApiHandler } from '@/lib/utils/api-middleware';
import { NotFoundError, ValidationError } from '@/lib/utils/api-error';

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
  featured: z.boolean().optional().default(false),
  status: z.string().min(1, 'Η κατάσταση είναι υποχρεωτική').default('active'),
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
export const POST = createApiHandler(
  projectSchema,
  async (_req, validData) => {
    try {
      logger.info(`Δημιουργία νέου project: ${validData.title}`, null, 'api-projects-POST');
      
      // Έλεγχος αν υπάρχει ήδη project με το ίδιο slug
      const existingProject = await projectsService.getProjectBySlug(validData.slug);
      if (existingProject) {
        throw new ValidationError(
          'Υπάρχει ήδη project με αυτό το slug', 
          { slug: ['Το slug χρησιμοποιείται ήδη'] }
        );
      }
      
      // Δεν περνάμε πλέον τα createdAt και updatedAt, θα τα διαχειριστεί το Drizzle
      const newProject = await projectsService.createProject(validData, {
        id: '1', // Mock ID for demonstration
        email: 'admin@example.com',
        role: Role.ADMIN
      });
      
      return apiResponse.success(
        { 
          message: 'Το project δημιουργήθηκε επιτυχώς', 
          project: newProject
        },
        undefined,
        201
      );
    } catch (error) {
      // Ελέγχουμε για συγκεκριμένα σφάλματα και τα μετατρέπουμε σε αντίστοιχες αποκρίσεις
      if (error instanceof ValidationError) {
        throw error; // Απλά μεταβιβάζουμε το σφάλμα στο middleware
      }
      
      // Άλλα σφάλματα θα πιαστούν από το error handling middleware
      throw error;
    }
  },
  {
    name: 'POST /api/projects',
    source: 'body',
    requireAuth: true
  }
);