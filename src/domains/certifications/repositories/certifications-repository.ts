// src/domains/certifications/repositories/certifications-repository.ts

import { eq, desc, asc, sql, SQL } from 'drizzle-orm';
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import { certifications } from '@/lib/db/schema/certifications';
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
 * Repository για την πρόσβαση και τη διαχείριση των certifications στη βάση δεδομένων.
 */
export class CertificationsRepository {
  /**
   * Ανάκτηση όλων των πιστοποιητικών με προαιρετική ταξινόμηση.
   */
  public async findAll(
    sortBy: 'issueDate' | 'title' = 'issueDate',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<Certification[]> {
    try {
      const database = await ensureDatabaseConnection();
      
      // Δημιουργία του order by clause
      let orderByClause: SQL<unknown>;
      if (sortBy === 'issueDate') {
        orderByClause = sortOrder === 'desc' 
          ? desc(certifications.issueDate)
          : asc(certifications.issueDate);
      } else {
        orderByClause = sortOrder === 'desc'
          ? desc(certifications.title)
          : asc(certifications.title);
      }
      
      // Εκτέλεση του query κατευθείαν και λήψη των αποτελεσμάτων
      return await database.select()
        .from(certifications)
        .orderBy(orderByClause);
    } catch (error) {
      logger.error('Error retrieving all certifications:', error, 'certifications-repository');
      throw new DatabaseError(
        'Σφάλμα κατά την ανάκτηση των πιστοποιητικών',
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση πιστοποιητικού με βάση το ID.
   */
  public async findById(id: string): Promise<Certification> {
    try {
      const database = await ensureDatabaseConnection();
      const [certification] = await database.select()
        .from(certifications)
        .where(eq(certifications.id, id))
        .limit(1);
      
      if (!certification) {
        throw new NotFoundError(`Το πιστοποιητικό με ID "${id}" δεν βρέθηκε`);
      }
      
      return certification;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error retrieving certification with ID ${id}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ανάκτηση του πιστοποιητικού με ID "${id}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση επιλεγμένων πιστοποιητικών.
   */
  public async findFeatured(): Promise<Certification[]> {
    try {
      const database = await ensureDatabaseConnection();
      return await database.select()
        .from(certifications)
        .where(eq(certifications.featured, true))
        .orderBy(desc(certifications.issueDate));
    } catch (error) {
      logger.error('Error retrieving featured certifications:', error, 'certifications-repository');
      throw new DatabaseError(
        'Σφάλμα κατά την ανάκτηση των επιλεγμένων πιστοποιητικών',
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση πιστοποιητικών με βάση το skill.
   */
  public async findBySkill(skill: string): Promise<Certification[]> {
    try {
      const database = await ensureDatabaseConnection();
      return await database.select()
        .from(certifications)
        .where(sql`${skill} = ANY(${certifications.skills})`)
        .orderBy(desc(certifications.issueDate));
    } catch (error) {
      logger.error(`Error retrieving certifications for skill ${skill}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ανάκτηση των πιστοποιητικών για το skill "${skill}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ανάκτηση πιστοποιητικών με βάση τον τύπο.
   */
  public async findByType(type: CertificationType): Promise<Certification[]> {
    try {
      const database = await ensureDatabaseConnection();
      return await database.select()
        .from(certifications)
        .where(eq(certifications.type, type))
        .orderBy(desc(certifications.issueDate));
    } catch (error) {
      logger.error(`Error retrieving certifications for type ${type}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ανάκτηση των πιστοποιητικών για τον τύπο "${type}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Δημιουργία νέου πιστοποιητικού.
   */
  public async create(certification: NewCertification): Promise<Certification> {
    try {
      const database = await ensureDatabaseConnection();
      const [result] = await database.insert(certifications)
        .values(certification)
        .returning();
      
      if (!result) {
        throw new DatabaseError('Σφάλμα κατά τη δημιουργία του πιστοποιητικού');
      }
      
      return result;
    } catch (error) {
      logger.error(`Error creating certification:`, error, 'certifications-repository');
      throw new DatabaseError(
        'Σφάλμα κατά τη δημιουργία του πιστοποιητικού',
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Ενημέρωση υπάρχοντος πιστοποιητικού.
   */
  public async update(id: string, data: Partial<Omit<NewCertification, 'id' | 'createdAt'>>): Promise<Certification> {
    try {
      const database = await ensureDatabaseConnection();
      
      // Έλεγχος αν το πιστοποιητικό υπάρχει
      const [existingCertification] = await database.select()
        .from(certifications)
        .where(eq(certifications.id, id))
        .limit(1);
      
      if (!existingCertification) {
        throw new NotFoundError(`Το πιστοποιητικό με ID "${id}" δεν βρέθηκε`);
      }
      
      // Ενημέρωση του πιστοποιητικού
      const [result] = await database.update(certifications)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(certifications.id, id))
        .returning();
      
      if (!result) {
        throw new DatabaseError('Σφάλμα κατά την ενημέρωση του πιστοποιητικού');
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error updating certification with ID ${id}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Σφάλμα κατά την ενημέρωση του πιστοποιητικού με ID "${id}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Διαγραφή πιστοποιητικού.
   */
  public async delete(id: string): Promise<void> {
    try {
      const database = await ensureDatabaseConnection();
      
      // Έλεγχος αν το πιστοποιητικό υπάρχει
      const [existingCertification] = await database.select()
        .from(certifications)
        .where(eq(certifications.id, id))
        .limit(1);
      
      if (!existingCertification) {
        throw new NotFoundError(`Το πιστοποιητικό με ID "${id}" δεν βρέθηκε`);
      }
      
      // Διαγραφή του πιστοποιητικού
      await database.delete(certifications)
        .where(eq(certifications.id, id));
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`Error deleting certification with ID ${id}:`, error, 'certifications-repository');
      throw new DatabaseError(
        `Σφάλμα κατά τη διαγραφή του πιστοποιητικού με ID "${id}"`,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// Singleton instance για εύκολη πρόσβαση
export const certificationsRepository = new CertificationsRepository();