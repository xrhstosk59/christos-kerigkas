// src/app/api/projects/[slug]/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { projectsService } from '@/lib/services/projects-service';
import { apiResponse } from '@/lib/utils/api-response';
import { checkAuth, getCurrentSession } from '@/lib/auth/server-auth';
import { logger } from '@/lib/utils/logger';
import { Role } from '@/lib/auth/access-control';

// Project validation schema για ενημέρωση
const projectUpdateSchema = z.object({
  slug: z.string().min(1, 'Το slug είναι υποχρεωτικό')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Το slug πρέπει να περιέχει μόνο πεζά γράμματα, αριθμούς και παύλες')
    .optional(),
  title: z.string().min(1, 'Ο τίτλος είναι υποχρεωτικός').max(100, 'Ο τίτλος είναι πολύ μεγάλος').optional(),
  description: z.string().min(1, 'Η περιγραφή είναι υποχρεωτική').optional(),
  shortDescription: z.string().optional(),
  categories: z.array(z.string()).min(1, 'Επιλέξτε τουλάχιστον μία κατηγορία').optional(),
  tech: z.array(z.string()).min(1, 'Επιλέξτε τουλάχιστον μία τεχνολογία').optional(),
  github: z.string().url('Το GitHub URL πρέπει να είναι έγκυρο URL').optional(),
  demo: z.string().url('Το Demo URL πρέπει να είναι έγκυρο URL').optional().nullable(),
  image: z.string().url('Η εικόνα πρέπει να είναι έγκυρο URL').optional(),
  featured: z.boolean().optional(),
});

/**
 * GET - Ανάκτηση συγκεκριμένου project με βάση το slug.
 */
export async function GET(
  request: NextRequest,
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
    logger.error(`Σφάλμα κατά την ανάκτηση project με slug ${context.params}:`, error, 'api-project-GET');
    return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ανάκτηση του project', error);
  }
}

/**
 * PUT - Ενημέρωση συγκεκριμένου project.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Έλεγχος αν ο χρήστης είναι authenticated
    await checkAuth();
    
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return apiResponse.badRequest('Το slug είναι υποχρεωτικό');
    }
    
    // Λήψη του τρέχοντος χρήστη
    const session = await getCurrentSession();
    if (!session.user) {
      return apiResponse.unauthorized();
    }
    
    // Λήψη και επικύρωση δεδομένων
    const body = await request.json();
    const validationResult = projectUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return apiResponse.validationError(validationResult.error);
    }
    
    const projectData = validationResult.data;
    logger.info(`Ενημέρωση project με slug ${slug}`, null, 'api-project-PUT');
    
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
    
    const updatedProject = await projectsService.updateProject(
      slug,
      projectData,
      {
        id: session.user.id,
        email: session.user.email,
        role: userRole
      }
    );
    
    if (!updatedProject) {
      return apiResponse.notFound('Το project δεν βρέθηκε');
    }
    
    // Μετατροπή των ημερομηνιών σε string μόνο αν υπάρχουν
    const formattedProject = {
      ...updatedProject,
      createdAt: updatedProject.createdAt ? updatedProject.createdAt.toISOString() : undefined,
      updatedAt: updatedProject.updatedAt ? updatedProject.updatedAt.toISOString() : undefined,
    };
    
    return apiResponse.success(
      { 
        message: 'Το project ενημερώθηκε επιτυχώς', 
        project: formattedProject
      },
      undefined,
      200
    );
  } catch (error) {
    logger.error(`Σφάλμα κατά την ενημέρωση project:`, error, 'api-project-PUT');
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return apiResponse.unauthorized();
      } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για την ενημέρωση project') {
        return apiResponse.forbidden(error.message);
      }
    }
    
    return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά την ενημέρωση του project', error);
  }
}

/**
 * DELETE - Διαγραφή συγκεκριμένου project.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Έλεγχος αν ο χρήστης είναι authenticated
    await checkAuth();
    
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return apiResponse.badRequest('Το slug είναι υποχρεωτικό');
    }
    
    // Λήψη του τρέχοντος χρήστη
    const session = await getCurrentSession();
    if (!session.user) {
      return apiResponse.unauthorized();
    }
    
    logger.info(`Διαγραφή project με slug ${slug}`, null, 'api-project-DELETE');
    
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
    
    await projectsService.deleteProject(
      slug,
      {
        id: session.user.id,
        email: session.user.email,
        role: userRole
      }
    );
    
    return apiResponse.success(
      { message: 'Το project διαγράφηκε επιτυχώς' },
      undefined,
      200
    );
  } catch (error) {
    logger.error(`Σφάλμα κατά τη διαγραφή project:`, error, 'api-project-DELETE');
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return apiResponse.unauthorized();
      } else if (error.message === 'Δεν έχετε τα απαραίτητα δικαιώματα για τη διαγραφή project') {
        return apiResponse.forbidden(error.message);
      }
    }
    
    return apiResponse.internalError('Παρουσιάστηκε σφάλμα κατά τη διαγραφή του project', error);
  }
}