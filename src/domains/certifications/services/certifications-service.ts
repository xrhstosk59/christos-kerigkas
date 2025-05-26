// src/domains/certifications/services/certifications-service.ts
import { certificationsRepository } from '../../../lib/db/repositories/certifications-repository';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/utils/logger';
import type { Certification, CertificationType } from '@/types/certifications';

/**
 * Cache keys για τα certifications
 */
const CACHE_KEYS = {
  all: 'certifications:all',
  featured: 'certifications:featured',
  byId: (id: string) => `certifications:id:${id}`,
  bySkill: (skill: string) => `certifications:skill:${skill}`,
  byType: (type: string) => `certifications:type:${type}`,
} as const;

/**
 * Service για τη διαχείριση των certifications.
 * Περιέχει την επιχειρησιακή λογική και χρησιμοποιεί το repository για πρόσβαση στα δεδομένα.
 */
export const certificationsService = {
  /**
   * Ανάκτηση όλων των certifications.
   * 
   * @returns Promise με όλα τα certifications
   */
  async getAllCertifications(): Promise<Certification[]> {
    try {
      return await cache.getOrSet<Certification[]>(
        CACHE_KEYS.all,
        async () => {
          const dbCertifications = await certificationsRepository.findAll();
          return dbCertifications.map(cert => ({
            id: cert.id,
            title: cert.title,
            issuer: cert.issuer,
            issueDate: typeof cert.issueDate === 'string' 
              ? cert.issueDate 
              : cert.issueDate.toISOString(),
            expirationDate: cert.expirationDate 
              ? (typeof cert.expirationDate === 'string' 
                  ? cert.expirationDate 
                  : cert.expirationDate.toISOString()) 
              : undefined,
            credentialId: cert.credentialId || undefined,
            credentialUrl: cert.credentialUrl || undefined,
            description: cert.description || undefined,
            skills: cert.skills || [],
            type: cert.type as CertificationType,
            filename: cert.filename,
            featured: cert.featured || false
          }));
        },
        { expireInSeconds: 60 * 30 } // 30 λεπτά
      );
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση των certifications:', error, 'certifications-service');
      return [];
    }
  },

  /**
   * Ανάκτηση certification με βάση το ID.
   * 
   * @param id Το ID του certification
   * @returns Promise με το certification ή null αν δεν βρεθεί
   */
  async getCertificationById(id: string): Promise<Certification | null> {
    try {
      return await cache.getOrSet<Certification | null>(
        CACHE_KEYS.byId(id),
        async () => {
          const dbCertification = await certificationsRepository.findById(id);
          if (!dbCertification) return null;

          return {
            id: dbCertification.id,
            title: dbCertification.title,
            issuer: dbCertification.issuer,
            issueDate: typeof dbCertification.issueDate === 'string' 
              ? dbCertification.issueDate 
              : dbCertification.issueDate.toISOString(),
            expirationDate: dbCertification.expirationDate 
              ? (typeof dbCertification.expirationDate === 'string' 
                  ? dbCertification.expirationDate 
                  : dbCertification.expirationDate.toISOString()) 
              : undefined,
            credentialId: dbCertification.credentialId || undefined,
            credentialUrl: dbCertification.credentialUrl || undefined,
            description: dbCertification.description || undefined,
            skills: dbCertification.skills || [],
            type: dbCertification.type as CertificationType,
            filename: dbCertification.filename,
            featured: dbCertification.featured || false
          };
        },
        { expireInSeconds: 60 * 60 } // 1 ώρα
      );
    } catch (error) {
      logger.error(`Σφάλμα κατά την ανάκτηση του certification με ID ${id}:`, error, 'certifications-service');
      return null;
    }
  },

  /**
   * Ανάκτηση των featured certifications.
   * 
   * @returns Promise με τα featured certifications
   */
  async getFeaturedCertifications(): Promise<Certification[]> {
    try {
      return await cache.getOrSet<Certification[]>(
        CACHE_KEYS.featured,
        async () => {
          const dbCertifications = await certificationsRepository.findFeatured();
          return dbCertifications.map(cert => ({
            id: cert.id,
            title: cert.title,
            issuer: cert.issuer,
            issueDate: typeof cert.issueDate === 'string' 
              ? cert.issueDate 
              : cert.issueDate.toISOString(),
            expirationDate: cert.expirationDate 
              ? (typeof cert.expirationDate === 'string' 
                  ? cert.expirationDate 
                  : cert.expirationDate.toISOString()) 
              : undefined,
            credentialId: cert.credentialId || undefined,
            credentialUrl: cert.credentialUrl || undefined,
            description: cert.description || undefined,
            skills: cert.skills || [],
            type: cert.type as CertificationType,
            filename: cert.filename,
            featured: cert.featured || false
          }));
        },
        { expireInSeconds: 60 * 30 } // 30 λεπτά
      );
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση των featured certifications:', error, 'certifications-service');
      return [];
    }
  },

  /**
   * Ανάκτηση certifications με βάση skill.
   * 
   * @param skill Το skill για αναζήτηση
   * @returns Promise με τα certifications που περιέχουν το skill
   */
  async getCertificationsBySkill(skill: string): Promise<Certification[]> {
    try {
      return await cache.getOrSet<Certification[]>(
        CACHE_KEYS.bySkill(skill),
        async () => {
          const dbCertifications = await certificationsRepository.findBySkill(skill);
          return dbCertifications.map(cert => ({
            id: cert.id,
            title: cert.title,
            issuer: cert.issuer,
            issueDate: typeof cert.issueDate === 'string' 
              ? cert.issueDate 
              : cert.issueDate.toISOString(),
            expirationDate: cert.expirationDate 
              ? (typeof cert.expirationDate === 'string' 
                  ? cert.expirationDate 
                  : cert.expirationDate.toISOString()) 
              : undefined,
            credentialId: cert.credentialId || undefined,
            credentialUrl: cert.credentialUrl || undefined,
            description: cert.description || undefined,
            skills: cert.skills || [],
            type: cert.type as CertificationType,
            filename: cert.filename,
            featured: cert.featured || false
          }));
        },
        { expireInSeconds: 60 * 30 } // 30 λεπτά
      );
    } catch (error) {
      logger.error(`Σφάλμα κατά την ανάκτηση certifications για skill ${skill}:`, error, 'certifications-service');
      return [];
    }
  },

  /**
   * Εκκαθάριση του cache για τα certifications.
   */
  async invalidateCache(): Promise<void> {
    try {
      await cache.invalidatePattern('certifications:*');
      logger.info('Cache για certifications εκκαθαρίστηκε', null, 'certifications-service');
    } catch (error) {
      logger.error('Σφάλμα κατά την εκκαθάριση του cache:', error, 'certifications-service');
    }
  },

  /**
   * Ανάκτηση στατιστικών για τα certifications.
   * 
   * @returns Promise με στατιστικά
   */
  async getCertificationsStats(): Promise<{
    total: number;
    featured: number;
    byType: Record<string, number>;
  }> {
    try {
      const allCertifications = await this.getAllCertifications();
      
      const stats = {
        total: allCertifications.length,
        featured: allCertifications.filter(cert => cert.featured).length,
        byType: allCertifications.reduce((acc, cert) => {
          acc[cert.type] = (acc[cert.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return stats;
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση στατιστικών certifications:', error, 'certifications-service');
      return {
        total: 0,
        featured: 0,
        byType: {}
      };
    }
  }
};