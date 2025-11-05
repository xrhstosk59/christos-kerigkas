// src/domains/certifications/repositories/certifications-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import {
  DatabaseError,
  NotFoundError
} from '@/lib/utils/errors/app-error';
import { logger } from '@/lib/utils/logger';
import type {
  Certification,
  NewCertification,
  CertificationType
} from '@/domains/certifications/models/certification.model';

/**
 * Repository for accessing and managing certifications in the database.
 */
export class CertificationsRepository {
  /**
   * Retrieve all certifications with optional sorting.
   */
  public async findAll(
    sortBy: 'issueDate' | 'title' = 'issueDate',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<Certification[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      const column = sortBy === 'issueDate' ? 'issue_date' : 'title';
      const ascending = sortOrder === 'asc';

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order(column, { ascending });

      if (error) {
        throw error;
      }

      return (data || []) as Certification[];
    } catch (error) {
      logger.error('Error retrieving all certifications:', error, 'certifications-repository');
      throw new DatabaseError(
        'Error retrieving certifications',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve certification by ID.
   */
  public async findById(id: string): Promise<Certification> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data: certification, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !certification) {
        throw new NotFoundError(`Certification with ID "${id}" not found`);
      }

      return certification as Certification;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error retrieving certification with ID ${id}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Error retrieving certification with ID "${id}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve featured certifications.
   */
  public async findFeatured(): Promise<Certification[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('featured', true)
        .order('issue_date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as Certification[];
    } catch (error) {
      logger.error('Error retrieving featured certifications:', error, 'certifications-repository');
      throw new DatabaseError(
        'Error retrieving featured certifications',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve certifications by skill.
   */
  public async findBySkill(skill: string): Promise<Certification[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .contains('skills', [skill])
        .order('issue_date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as Certification[];
    } catch (error) {
      logger.error(`Error retrieving certifications for skill ${skill}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Error retrieving certifications for skill "${skill}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve certifications by type.
   */
  public async findByType(type: CertificationType): Promise<Certification[]> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('type', type)
        .order('issue_date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as Certification[];
    } catch (error) {
      logger.error(`Error retrieving certifications for type ${type}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Error retrieving certifications for type "${type}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create new certification.
   */
  public async create(certification: NewCertification): Promise<Certification> {
    try {
      const supabase = await ensureDatabaseConnection();

      const { data: result, error } = await supabase
        .from('certifications')
        .insert(certification as any)
        .select()
        .single();

      if (error || !result) {
        throw new DatabaseError('Error creating certification');
      }

      return result as Certification;
    } catch (error) {
      logger.error(`Error creating certification:`, error, 'certifications-repository');
      throw new DatabaseError(
        'Error creating certification',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update existing certification.
   */
  public async update(id: string, data: Partial<Omit<NewCertification, 'id' | 'createdAt'>>): Promise<Certification> {
    try {
      const supabase = await ensureDatabaseConnection();

      // Check if certification exists
      const { data: existingCertification } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingCertification) {
        throw new NotFoundError(`Certification with ID "${id}" not found`);
      }

      // Update the certification
      const { data: result, error } = await supabase
        .from('certifications')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error || !result) {
        throw new DatabaseError('Error updating certification');
      }

      return result as Certification;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error updating certification with ID ${id}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Error updating certification with ID "${id}"`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete certification.
   */
  public async delete(id: string): Promise<void> {
    try {
      const supabase = await ensureDatabaseConnection();

      // Check if certification exists
      const { data: existingCertification } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingCertification) {
        throw new NotFoundError(`Certification with ID "${id}" not found`);
      }

      // Delete the certification
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error(`Error deleting certification with ID ${id}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Error deleting certification with ID "${id}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// Singleton instance for easy access
export const certificationsRepository = new CertificationsRepository();
