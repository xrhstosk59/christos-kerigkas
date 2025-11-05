// src/domains/projects/repositories/projects-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import {
  DatabaseError,
  NotFoundError,
  ConflictError
} from '@/lib/utils/errors/app-error';
import { logger } from '@/lib/utils/logger';
import type { Project, NewProject } from '@/domains/projects/models/project.model';

/**
 * Repository for accessing and managing projects in the database.
 */
export class ProjectsRepository {
  /**
   * Retrieve all projects with optional limit.
   */
  public async findAll(limitCount?: number): Promise<Project[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      let query = supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true });

      if (limitCount) {
        query = query.limit(limitCount);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as Project[];
    } catch (error) {
      logger.error('Error retrieving all projects:', error, 'projects-repository');
      throw new DatabaseError(
        'Error retrieving projects',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve featured projects.
   */
  public async findFeatured(): Promise<Project[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []) as Project[];
    } catch (error) {
      logger.error('Error retrieving featured projects:', error, 'projects-repository');
      throw new DatabaseError(
        'Error retrieving featured projects',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve project by slug.
   */
  public async findBySlug(slug: string): Promise<Project> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !project) {
        throw new NotFoundError(`Project with slug "${slug}" not found`);
      }

      return project as Project;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error retrieving project with slug ${slug}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Error retrieving project with slug "${slug}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve projects by category.
   */
  public async findByCategory(category: string): Promise<Project[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .contains('categories', [category])
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []) as Project[];
    } catch (error) {
      logger.error(`Error retrieving projects for category ${category}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Error retrieving projects for category "${category}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create new project.
   */
  public async create(project: NewProject): Promise<Project> {
    try {
      const supabase = await ensureDatabaseConnection();

      // Check for duplicate slug
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', project.slug)
        .single();

      if (existing) {
        throw new ConflictError(`Project with slug "${project.slug}" already exists`);
      }

      const { data: result, error } = await supabase
        .from('projects')
        .insert(project as any)
        .select()
        .single();

      if (error || !result) {
        throw new DatabaseError('Error creating project');
      }

      return result as Project;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      logger.error(`Error creating project:`, error, 'projects-repository');
      throw new DatabaseError(
        'Error creating project',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update existing project.
   */
  public async update(slug: string, project: Partial<Omit<NewProject, 'createdAt'>>): Promise<Project> {
    try {
      const supabase = await ensureDatabaseConnection();

      // Check if project exists
      const { data: existingProject } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!existingProject) {
        throw new NotFoundError(`Project with slug "${slug}" not found`);
      }

      // Update the project
      const { data: result, error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString()
        } as any)
        .eq('slug', slug)
        .select()
        .single();

      if (error || !result) {
        throw new DatabaseError('Error updating project');
      }

      return result as Project;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error updating project with slug ${slug}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Error updating project with slug "${slug}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete project.
   */
  public async delete(slug: string): Promise<void> {
    try {
      const supabase = await ensureDatabaseConnection();

      // Check if project exists
      const { data: existingProject } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!existingProject) {
        throw new NotFoundError(`Project with slug "${slug}" not found`);
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('slug', slug);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error deleting project with slug ${slug}:`, error, 'projects-repository');
      throw new DatabaseError(
        `Error deleting project with slug "${slug}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// Singleton instance for easy access
export const projectsRepository = new ProjectsRepository();
