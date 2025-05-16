// src/lib/db/repositories/projects-repository.ts
import { projects, cryptoProjects, type NewProject, type NewCryptoProject, type Project, type CryptoProject } from '@/lib/db/schema/projects';
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import { eq, sql } from 'drizzle-orm';
import { mapDbProjectToProject } from '@/lib/db/utils/mappers';

/**
 * Repository για τα projects
 */
export const projectsRepository = {
  /**
   * Εύρεση όλων των projects
   */
  async findAll(limitCount?: number): Promise<Project[]> {
    const database = await ensureDatabaseConnection(); 
    const query = database.select()
      .from(projects)
      .orderBy(projects.order);
    
    if (limitCount) {
      const results = await query.limit(limitCount);
      return results.map(project => mapDbProjectToProject(project));
    }
    
    const results = await query;
    return results.map(project => mapDbProjectToProject(project));
  },
  
  /**
   * Εύρεση προτεινόμενων (featured) projects
   */
  async findFeatured(): Promise<Project[]> {
    const database = await ensureDatabaseConnection();
    const results = await database.select()
      .from(projects)
      .where(eq(projects.featured, true))
      .orderBy(projects.order);
    
    return results.map(project => mapDbProjectToProject(project));
  },
  
  /**
   * Εύρεση project με βάση το slug
   */
  async findBySlug(slug: string): Promise<Project | undefined> {
    const database = await ensureDatabaseConnection();
    const [project] = await database.select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    
    return project ? mapDbProjectToProject(project) : undefined;
  },
  
  /**
   * Εύρεση projects με βάση την κατηγορία
   */
  async findByCategory(category: string): Promise<Project[]> {
    const database = await ensureDatabaseConnection();
    const results = await database.select()
      .from(projects)
      .where(sql`${category} = ANY(${projects.categories})`)
      .orderBy(projects.order);
    
    return results.map(project => mapDbProjectToProject(project));
  },
  
  /**
   * Δημιουργία νέου project
   */
  async create(project: NewProject): Promise<Project> {
    const database = await ensureDatabaseConnection();
    const [result] = await database.insert(projects)
      .values(project)
      .returning();
    
    return mapDbProjectToProject(result);
  },
  
  /**
   * Ενημέρωση υπάρχοντος project
   */
  async update(slug: string, project: Partial<Omit<NewProject, 'createdAt'>>): Promise<Project | undefined> {
    const database = await ensureDatabaseConnection();
    const [result] = await database.update(projects)
      .set({
        ...project,
        updatedAt: new Date()
      })
      .where(eq(projects.slug, slug))
      .returning();
    
    return result ? mapDbProjectToProject(result) : undefined;
  },
  
  /**
   * Διαγραφή project
   */
  async delete(slug: string): Promise<void> {
    const database = await ensureDatabaseConnection();
    await database.delete(projects)
      .where(eq(projects.slug, slug));
  }
};

/**
 * Repository για τα crypto projects
 */
export const cryptoProjectsRepository = {
  /**
   * Εύρεση όλων των crypto projects
   */
  async findAll(): Promise<CryptoProject[]> {
    const database = await ensureDatabaseConnection();
    const results = await database.select()
      .from(cryptoProjects)
      .orderBy(cryptoProjects.id);
    
    return results;
  },
  
  /**
   * Εύρεση crypto project με βάση το slug
   */
  async findBySlug(slug: string): Promise<CryptoProject | undefined> {
    const database = await ensureDatabaseConnection();
    const [project] = await database.select()
      .from(cryptoProjects)
      .where(eq(cryptoProjects.slug, slug))
      .limit(1);
    
    return project;
  },
  
  /**
   * Δημιουργία νέου crypto project
   */
  async create(project: NewCryptoProject): Promise<CryptoProject> {
    const database = await ensureDatabaseConnection();
    const [result] = await database.insert(cryptoProjects)
      .values(project)
      .returning();
    
    return result;
  },
  
  /**
   * Ενημέρωση υπάρχοντος crypto project
   */
  async update(slug: string, project: Partial<Omit<NewCryptoProject, 'createdAt'>>): Promise<CryptoProject | undefined> {
    const database = await ensureDatabaseConnection();
    const [result] = await database.update(cryptoProjects)
      .set({
        ...project,
        updatedAt: new Date()
      })
      .where(eq(cryptoProjects.slug, slug))
      .returning();
    
    return result;
  },
  
  /**
   * Διαγραφή crypto project
   */
  async delete(slug: string): Promise<void> {
    const database = await ensureDatabaseConnection();
    await database.delete(cryptoProjects)
      .where(eq(cryptoProjects.slug, slug));
  }
}