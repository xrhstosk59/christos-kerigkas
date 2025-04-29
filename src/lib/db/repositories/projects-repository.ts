// src/lib/db/repositories/projects-repository.ts
import { projects, cryptoProjects, type NewProject, type NewCryptoProject, type Project, type CryptoProject } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { eq, sql } from 'drizzle-orm'

export const projectsRepository = {
  async findAll(limitCount?: number): Promise<Project[]> {
    const database = ensureDatabaseConnection();
    const query = database.select()
      .from(projects)
      .orderBy(projects.order);
    
    if (limitCount) {
      return query.limit(limitCount);
    }
    
    return query;
  },
  
  async findFeatured(): Promise<Project[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(projects)
      .where(eq(projects.featured, true))
      .orderBy(projects.order);
  },
  
  async findBySlug(slug: string): Promise<Project | undefined> {
    const database = ensureDatabaseConnection();
    const [project] = await database.select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    
    return project;
  },
  
  async findByCategory(category: string): Promise<Project[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(projects)
      .where(sql`${category} = ANY(${projects.categories})`)
      .orderBy(projects.order);
  },
  
  async create(project: NewProject): Promise<Project> {
    const database = ensureDatabaseConnection();
    const [result] = await database.insert(projects)
      .values(project)
      .returning();
    
    return result;
  },
  
  async update(slug: string, project: Partial<Omit<NewProject, 'createdAt'>>): Promise<Project | undefined> {
    const database = ensureDatabaseConnection();
    const [result] = await database.update(projects)
      .set({
        ...project,
        updatedAt: new Date()
      })
      .where(eq(projects.slug, slug))
      .returning();
    
    return result;
  },
  
  async delete(slug: string): Promise<void> {
    const database = ensureDatabaseConnection();
    await database.delete(projects)
      .where(eq(projects.slug, slug));
  }
};

export const cryptoProjectsRepository = {
  async findAll(): Promise<CryptoProject[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(cryptoProjects)
      .orderBy(cryptoProjects.id);
  },
  
  async findBySlug(slug: string): Promise<CryptoProject | undefined> {
    const database = ensureDatabaseConnection();
    const [project] = await database.select()
      .from(cryptoProjects)
      .where(eq(cryptoProjects.slug, slug))
      .limit(1);
    
    return project;
  },
  
  async create(project: NewCryptoProject): Promise<CryptoProject> {
    const database = ensureDatabaseConnection();
    const [result] = await database.insert(cryptoProjects)
      .values(project)
      .returning();
    
    return result;
  },
  
  async update(slug: string, project: Partial<Omit<NewCryptoProject, 'createdAt'>>): Promise<CryptoProject | undefined> {
    const database = ensureDatabaseConnection();
    const [result] = await database.update(cryptoProjects)
      .set({
        ...project,
        updatedAt: new Date()
      })
      .where(eq(cryptoProjects.slug, slug))
      .returning();
    
    return result;
  },
  
  async delete(slug: string): Promise<void> {
    const database = ensureDatabaseConnection();
    await database.delete(cryptoProjects)
      .where(eq(cryptoProjects.slug, slug));
  }
}