// src/domains/projects/repositories/projects-repository.ts

import { eq, sql } from 'drizzle-orm';
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import { projects } from '@/lib/db/schema';
import { 
  DatabaseError, 
  NotFoundError, 
  ConflictError 
} from '@/lib/utils/errors/app-error';
import { logger } from '@/lib/utils/logger';

import type { Project, NewProject } from '@/domains/projects/models/project.model';

/**
 * Repository για την πρόσβαση και τη διαχείριση των projects στη βάση δεδομένων.
 */
export class ProjectsRepository {
  /**
   * Ανάκτηση όλων των projects με προαιρετικό όριο.
   */
  public async findAll(limitCount?: number): Promise<Project[]> {
    try {
      const database = await ensureDatabaseConnection();
      const query = database.select()
        .from(projects)
        .orderBy(projects.order);
      
      if (limitCount) {
        return await query.limit(limitCount);
      }
      
      return await query; // Προσθήκη του await
    } catch (error) {
      logger.error('Error retrieving all projects:', error, 'projects-repository');
      throw new DatabaseError(
        'Σφάλμα κατά την ανάκτηση των projects',
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση επιλεγμένων projects.
   */
  public async findFeatured(): Promise<Project[]> {
    try {
      const database = await ensureDatabaseConnection();
      return await database.select() // Προσθήκη του await
        .from(projects)
        .where(eq(projects.featured, true))
        .orderBy(projects.order);
    } catch (error) {
      logger.error('Error retrieving featured projects:', error, 'projects-repository');
      throw new DatabaseError(
        'Σφάλμα κατά την ανάκτηση των επιλεγμένων projects',
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση project με βάση το slug.
   */
  public async findBySlug(slug: string): Promise<Project> {
    try {
      const database = await ensureDatabaseConnection();
      const [project] = await database.select()
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);
      
      if (!project) {
        throw new NotFoundError(`Το project με slug "${slug}" δεν βρέθηκε`);
      }
      
      return project;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error retrieving project with slug ${slug}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ανάκτηση του project με slug "${slug}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση projects με βάση την κατηγορία.
   */
  public async findByCategory(category: string): Promise<Project[]> {
    try {
      const database = await ensureDatabaseConnection();
      return await database.select() // Προσθήκη του await
        .from(projects)
        .where(sql`${category} = ANY(${projects.categories})`)
        .orderBy(projects.order);
    } catch (error) {
      logger.error(`Error retrieving projects for category ${category}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ανάκτηση των projects για την κατηγορία "${category}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Δημιουργία νέου project.
   */
  public async create(project: NewProject): Promise<Project> {
    try {
      // Έλεγχος για duplicate slug
      const database = await ensureDatabaseConnection();
      const existing = await database.select({ count: sql`count(*)` })
        .from(projects)
        .where(eq(projects.slug, project.slug));
      
      if ((existing[0].count as number) > 0) { // Προσθήκη type assertion
        throw new ConflictError(`Υπάρχει ήδη project με το slug "${project.slug}"`);
      }
      
      const [result] = await database.insert(projects)
        .values(project)
        .returning();
      
      if (!result) {
        throw new DatabaseError('Σφάλμα κατά τη δημιουργία του project');
      }
      
      return result;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      
      logger.error(`Error creating project:`, error, 'projects-repository');
      throw new DatabaseError(
        'Σφάλμα κατά τη δημιουργία του project',
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ενημέρωση υπάρχοντος project.
   */
  public async update(slug: string, project: Partial<Omit<NewProject, 'createdAt'>>): Promise<Project> {
    try {
      const database = await ensureDatabaseConnection();
      
      // Έλεγχος αν το project υπάρχει
      const [existingProject] = await database.select()
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);
      
      if (!existingProject) {
        throw new NotFoundError(`Το project με slug "${slug}" δεν βρέθηκε`);
      }
      
      // Ενημέρωση του project
      const [result] = await database.update(projects)
        .set({
          ...project,
          updatedAt: new Date()
        })
        .where(eq(projects.slug, slug))
        .returning();
      
      if (!result) {
        throw new DatabaseError('Σφάλμα κατά την ενημέρωση του project');
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error updating project with slug ${slug}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ενημέρωση του project με slug "${slug}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Διαγραφή project.
   */
  public async delete(slug: string): Promise<void> {
    try {
      const database = await ensureDatabaseConnection();
      
      // Έλεγχος αν το project υπάρχει
      const [existingProject] = await database.select()
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);
      
      if (!existingProject) {
        throw new NotFoundError(`Το project με slug "${slug}" δεν βρέθηκε`);
      }
      
      // Διαγραφή του project
      await database.delete(projects)
        .where(eq(projects.slug, slug));
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error deleting project with slug ${slug}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Σφάλμα κατά τη διαγραφή του project με slug "${slug}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// Singleton instance για εύκολη πρόσβαση
export const projectsRepository = new ProjectsRepository();