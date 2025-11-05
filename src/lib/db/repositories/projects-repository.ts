// src/lib/db/repositories/projects-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';

// Types for projects based on Supabase schema
type Project = Database['public']['Tables']['projects']['Row'];
type NewProject = Database['public']['Tables']['projects']['Insert'];
type CryptoProject = Database['public']['Tables']['crypto_projects']['Row'];
type NewCryptoProject = Database['public']['Tables']['crypto_projects']['Insert'];

/**
 * Repository for projects
 */
export const projectsRepository = {
  /**
   * Find all projects
   */
  async findAll(limitCount?: number): Promise<Project[]> {
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
      console.error('Error fetching projects:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Find featured projects
   */
  async findFeatured(): Promise<Project[]> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Find project by slug
   */
  async findBySlug(slug: string): Promise<Project | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching project by slug:', error);
      return undefined;
    }

    return data || undefined;
  },

  /**
   * Find projects by category
   */
  async findByCategory(category: string): Promise<Project[]> {
    const supabase = await ensureDatabaseConnection();

    // Using PostgreSQL array contains operator
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .contains('categories', [category])
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching projects by category:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Create new project
   */
  async create(project: NewProject): Promise<Project | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return undefined;
    }

    return data || undefined;
  },

  /**
   * Update existing project
   */
  async update(slug: string, project: Partial<Omit<NewProject, 'created_at'>>): Promise<Project | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...project,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return undefined;
    }

    return data || undefined;
  },

  /**
   * Delete project
   */
  async delete(slug: string): Promise<void> {
    const supabase = await ensureDatabaseConnection();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting project:', error);
    }
  }
};

/**
 * Repository for crypto projects
 */
export const cryptoProjectsRepository = {
  /**
   * Find all crypto projects
   */
  async findAll(): Promise<CryptoProject[]> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('crypto_projects')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching crypto projects:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Find crypto project by slug
   */
  async findBySlug(slug: string): Promise<CryptoProject | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('crypto_projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching crypto project by slug:', error);
      return undefined;
    }

    return data || undefined;
  },

  /**
   * Create new crypto project
   */
  async create(project: NewCryptoProject): Promise<CryptoProject | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('crypto_projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error('Error creating crypto project:', error);
      return undefined;
    }

    return data || undefined;
  },

  /**
   * Update existing crypto project
   */
  async update(slug: string, project: Partial<Omit<NewCryptoProject, 'created_at'>>): Promise<CryptoProject | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('crypto_projects')
      .update({
        ...project,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating crypto project:', error);
      return undefined;
    }

    return data || undefined;
  },

  /**
   * Delete crypto project
   */
  async delete(slug: string): Promise<void> {
    const supabase = await ensureDatabaseConnection();

    const { error } = await supabase
      .from('crypto_projects')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting crypto project:', error);
    }
  }
};

// Export types for convenience
export type { Project, NewProject, CryptoProject, NewCryptoProject };
