// src/lib/services/projects-service.ts
import { projectsRepository, cryptoProjectsRepository } from '@/lib/db/repositories/projects-repository';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/lib/db/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type CryptoProject = Database['public']['Tables']['crypto_projects']['Row'];

/**
 * Παράμετροι αναζήτησης για projects.
 */
export interface ProjectsSearchParams {
  category?: string;
  featured?: boolean;
  limit?: number;
  sortBy?: 'order' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Αποτέλεσμα με αριθμό αποτελεσμάτων για projects.
 */
export interface ProjectsResult {
  projects: Project[];
  total: number;
}

/**
 * Service για τη διαχείριση των projects.
 * Περιέχει την επιχειρησιακή λογική και χρησιμοποιεί το repository για πρόσβαση στα δεδομένα.
 */
export const projectsService = {
  /**
   * Ανάκτηση projects με δυνατότητα φιλτραρίσματος.
   * 
   * @param params Παράμετροι αναζήτησης
   * @returns Promise με τα αποτελέσματα
   */
  async getProjects(params: ProjectsSearchParams): Promise<ProjectsResult> {
    const { 
      category, 
      featured, 
      limit,
      // sortBy = 'order',
      // sortOrder = 'desc'
    } = params;
    
    let cacheKey = `projects`;
    if (category) cacheKey += `:category:${category}`;
    if (featured !== undefined) cacheKey += `:featured:${featured}`;
    if (limit) cacheKey += `:limit:${limit}`;
    
    try {
      // Προσπάθεια ανάκτησης από το cache
      return await cache.getOrSet<ProjectsResult>(
        cacheKey,
        async () => {
          let projects: Project[] = [];
          
          if (featured !== undefined) {
            // Αν έχει οριστεί το featured, ανακτούμε τα featured projects
            if (featured) {
              projects = await projectsRepository.findFeatured();
            } else {
              // Αν featured=false, ανακτούμε όλα και φιλτράρουμε τα μη featured
              const allProjects = await projectsRepository.findAll(limit);
              projects = allProjects.filter(p => !p.featured);
            }
          } else if (category) {
            // Αν έχει οριστεί κατηγορία, φιλτράρουμε με βάση αυτή
            projects = await projectsRepository.findByCategory(category);
            
            // Αν υπάρχει limit, περιορίζουμε τα αποτελέσματα
            if (limit && projects.length > limit) {
              projects = projects.slice(0, limit);
            }
          } else {
            // Διαφορετικά, επιστρέφουμε όλα τα projects
            projects = await projectsRepository.findAll(limit);
          }
          
          return {
            projects,
            total: projects.length
          };
        },
        { expireInSeconds: 60 * 15 } // 15 λεπτά
      );
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση των projects:', error, 'project-service');
      return {
        projects: [],
        total: 0
      };
    }
  },
  
  /**
   * Ανάκτηση ενός συγκεκριμένου project με βάση το slug.
   * 
   * @param slug Το slug του project
   * @returns Promise με το project ή null αν δεν βρεθεί
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const cacheKey = `project:slug:${slug}`;
    
    try {
      return await cache.getOrSet<Project | null>(
        cacheKey,
        async () => {
          const project = await projectsRepository.findBySlug(slug);
          return project || null;
        },
        { expireInSeconds: 60 * 30 } // 30 λεπτά
      );
    } catch (error) {
      logger.error(`Σφάλμα κατά την ανάκτηση του project με slug ${slug}:`, error, 'project-service');
      return null;
    }
  },
  
  // createProject, updateProject, and deleteProject methods removed - projects managed directly in database or CMS
  
  /**
   * Εκκαθάριση του cache για τη λίστα των projects.
   */
  async invalidateProjectsCache(): Promise<void> {
    await cache.invalidatePattern('projects:*');
  },

  /**
   * Ανάκτηση όλων των crypto projects.
   * 
   * @returns Promise με τα crypto projects
   */
  async getCryptoProjects(): Promise<CryptoProject[]> {
    const cacheKey = 'crypto-projects:all';
    
    try {
      return await cache.getOrSet<CryptoProject[]>(
        cacheKey,
        () => cryptoProjectsRepository.findAll(),
        { expireInSeconds: 60 * 15 } // 15 λεπτά
      );
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση των crypto projects:', error, 'project-service');
      return [];
    }
  },
  
  /**
   * Ανάκτηση ενός συγκεκριμένου crypto project με βάση το slug.
   * 
   * @param slug Το slug του crypto project
   * @returns Promise με το crypto project ή null αν δεν βρεθεί
   */
  async getCryptoProjectBySlug(slug: string): Promise<CryptoProject | null> {
    const cacheKey = `crypto-project:slug:${slug}`;
    
    try {
      return await cache.getOrSet<CryptoProject | null>(
        cacheKey,
        async () => {
          const project = await cryptoProjectsRepository.findBySlug(slug);
          return project || null;
        },
        { expireInSeconds: 60 * 30 } // 30 λεπτά
      );
    } catch (error) {
      logger.error(`Σφάλμα κατά την ανάκτηση του crypto project με slug ${slug}:`, error, 'project-service');
      return null;
    }
  },
  
  // createCryptoProject, updateCryptoProject, and deleteCryptoProject methods removed - crypto projects managed directly in database or CMS
};