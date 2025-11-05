// src/lib/services/projects-service.ts
import { projectsRepository, cryptoProjectsRepository } from '@/lib/db/repositories/projects-repository';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/lib/db/database.types';
import { Permission, UserWithRole, checkPermission } from '@/lib/auth/access-control';

type Project = Database['public']['Tables']['projects']['Row'];
type NewProject = Database['public']['Tables']['projects']['Insert'];
type CryptoProject = Database['public']['Tables']['crypto_projects']['Row'];
type NewCryptoProject = Database['public']['Tables']['crypto_projects']['Insert'];

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
  
  /**
   * Δημιουργία νέου project.
   * 
   * @param project Τα δεδομένα του νέου project
   * @param user Ο χρήστης που επιχειρεί τη δημιουργία
   * @returns Promise με το νέο project
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα
   */
  async createProject(project: NewProject, user: UserWithRole): Promise<Project> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.WRITE_PROJECTS)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για τη δημιουργία project');
    }
    
    try {
      // Δημιουργία του project
      // Υπολογισμός αυτόματης σειράς ταξινόμησης μέσω του repository
      // Το πεδίο order δεν υπάρχει στον τύπο NewProject, οπότε δεν το χρησιμοποιούμε εδώ
      const newProject = await projectsRepository.create(project);

      if (!newProject) {
        throw new Error('Αποτυχία δημιουργίας project - δεν επιστράφηκε αποτέλεσμα');
      }

      // Εκκαθάριση του cache για τη λίστα projects
      await this.invalidateProjectsCache();

      logger.info(`Δημιουργία νέου project με slug: ${newProject.slug}`, null, 'project-service');

      return newProject;
    } catch (error) {
      logger.error('Σφάλμα κατά τη δημιουργία project:', error, 'project-service');
      throw new Error('Παρουσιάστηκε σφάλμα κατά τη δημιουργία του project');
    }
  },
  
  /**
   * Ενημέρωση ενός υπάρχοντος project.
   * 
   * @param slug Το slug του project προς ενημέρωση
   * @param projectData Τα νέα δεδομένα του project
   * @param user Ο χρήστης που επιχειρεί την ενημέρωση
   * @returns Promise με το ενημερωμένο project
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα ή αν το project δεν βρεθεί
   */
  async updateProject(slug: string, projectData: Partial<Omit<NewProject, "createdAt">>, user: UserWithRole): Promise<Project | null> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.WRITE_PROJECTS)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για την ενημέρωση project');
    }
    
    try {
      // Έλεγχος αν το project υπάρχει
      const existingProject = await projectsRepository.findBySlug(slug);
      if (!existingProject) {
        throw new Error('Το project δεν βρέθηκε');
      }
      
      // Ενημέρωση του project
      // Το πεδίο updatedAt δεν υπάρχει στον τύπο Partial<Omit<NewProject, "createdAt">>, 
      // οπότε το διαχειριζόμαστε μέσω του repository
      const updatedProject = await projectsRepository.update(slug, projectData);
      
      if (!updatedProject) {
        throw new Error('Το project δεν βρέθηκε κατά την ενημέρωση');
      }
      
      // Εκκαθάριση του cache για το συγκεκριμένο project και τη λίστα
      await cache.delete(`project:slug:${slug}`);
      if (projectData.slug && projectData.slug !== slug) {
        await cache.delete(`project:slug:${projectData.slug}`);
      }
      await this.invalidateProjectsCache();
      
      logger.info(`Ενημέρωση project με slug: ${slug} -> ${updatedProject.slug}`, null, 'project-service');
      
      return updatedProject;
    } catch (error) {
      logger.error(`Σφάλμα κατά την ενημέρωση project με slug ${slug}:`, error, 'project-service');
      throw error;
    }
  },
  
  /**
   * Διαγραφή ενός project.
   * 
   * @param slug Το slug του project προς διαγραφή
   * @param user Ο χρήστης που επιχειρεί τη διαγραφή
   * @returns Promise που ολοκληρώνεται μετά τη διαγραφή
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα
   */
  async deleteProject(slug: string, user: UserWithRole): Promise<void> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.DELETE_PROJECTS)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για τη διαγραφή project');
    }
    
    try {
      // Διαγραφή του project
      await projectsRepository.delete(slug);
      
      // Εκκαθάριση του cache για το συγκεκριμένο project και τη λίστα
      await cache.delete(`project:slug:${slug}`);
      await this.invalidateProjectsCache();
      
      logger.info(`Διαγραφή project με slug: ${slug}`, null, 'project-service');
    } catch (error) {
      logger.error(`Σφάλμα κατά τη διαγραφή project με slug ${slug}:`, error, 'project-service');
      throw new Error('Παρουσιάστηκε σφάλμα κατά τη διαγραφή του project');
    }
  },
  
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
  
  /**
   * Δημιουργία νέου crypto project.
   * 
   * @param project Τα δεδομένα του νέου crypto project
   * @param user Ο χρήστης που επιχειρεί τη δημιουργία
   * @returns Promise με το νέο crypto project
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα
   */
  async createCryptoProject(project: NewCryptoProject, user: UserWithRole): Promise<CryptoProject> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.WRITE_PROJECTS)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για τη δημιουργία crypto project');
    }
    
    try {
      // Δημιουργία του crypto project
      const newProject = await cryptoProjectsRepository.create(project);

      if (!newProject) {
        throw new Error('Αποτυχία δημιουργίας crypto project - δεν επιστράφηκε αποτέλεσμα');
      }

      // Εκκαθάριση του cache
      await cache.delete('crypto-projects:all');

      logger.info(`Δημιουργία νέου crypto project με id: ${newProject.id}`, null, 'project-service');

      return newProject;
    } catch (error) {
      logger.error('Σφάλμα κατά τη δημιουργία crypto project:', error, 'project-service');
      throw new Error('Παρουσιάστηκε σφάλμα κατά τη δημιουργία του crypto project');
    }
  },
  
  /**
   * Ενημέρωση ενός υπάρχοντος crypto project.
   *
   * @param id Το id του crypto project προς ενημέρωση
   * @param projectData Τα νέα δεδομένα του crypto project
   * @param user Ο χρήστης που επιχειρεί την ενημέρωση
   * @returns Promise με το ενημερωμένο crypto project
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα ή αν το project δεν βρεθεί
   */
  async updateCryptoProject(id: number, projectData: Partial<Omit<NewCryptoProject, "createdAt">>, user: UserWithRole): Promise<CryptoProject | null> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.WRITE_PROJECTS)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για την ενημέρωση crypto project');
    }

    try {
      // Έλεγχος αν το crypto project υπάρχει
      const existingProject = await cryptoProjectsRepository.findById(id);
      if (!existingProject) {
        throw new Error('Το crypto project δεν βρέθηκε');
      }

      // Ενημέρωση του crypto project
      // Το πεδίο updatedAt δεν υπάρχει στον τύπο Partial<Omit<NewCryptoProject, "createdAt">>,
      // οπότε το διαχειριζόμαστε μέσω του repository
      const updatedProject = await cryptoProjectsRepository.update(id, projectData);

      if (!updatedProject) {
        throw new Error('Το crypto project δεν βρέθηκε κατά την ενημέρωση');
      }

      // Εκκαθάριση του cache
      await cache.delete(`crypto-project:id:${id}`);
      await cache.delete('crypto-projects:all');

      logger.info(`Ενημέρωση crypto project με id: ${id}`, null, 'project-service');

      return updatedProject;
    } catch (error) {
      logger.error(`Σφάλμα κατά την ενημέρωση crypto project με id ${id}:`, error, 'project-service');
      throw error;
    }
  },
  
  /**
   * Διαγραφή ενός crypto project.
   * 
   * @param slug Το slug του crypto project προς διαγραφή
   * @param user Ο χρήστης που επιχειρεί τη διαγραφή
   * @returns Promise που ολοκληρώνεται μετά τη διαγραφή
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα
   */
  async deleteCryptoProject(slug: string, user: UserWithRole): Promise<void> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.DELETE_PROJECTS)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για τη διαγραφή crypto project');
    }
    
    try {
      // Διαγραφή του crypto project
      await cryptoProjectsRepository.delete(slug);
      
      // Εκκαθάριση του cache
      await cache.delete(`crypto-project:slug:${slug}`);
      await cache.delete('crypto-projects:all');
      
      logger.info(`Διαγραφή crypto project με slug: ${slug}`, null, 'project-service');
    } catch (error) {
      logger.error(`Σφάλμα κατά τη διαγραφή crypto project με slug ${slug}:`, error, 'project-service');
      throw new Error('Παρουσιάστηκε σφάλμα κατά τη διαγραφή του crypto project');
    }
  }
};