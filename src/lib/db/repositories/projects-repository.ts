// src/lib/db/repositories/projects-repository.ts
import { db } from '@/lib/db'
import { projects, cryptoProjects, type NewProject, type NewCryptoProject } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export const projectsRepository = {
  async findAll(limitCount?: number) {
    const query = db.select()
      .from(projects)
      .orderBy(projects.order)
    
    if (limitCount) {
      return await query.limit(limitCount)
    }
    
    return await query
  },
  
  async findFeatured() {
    return await db.select()
      .from(projects)
      .where(eq(projects.featured, true))
      .orderBy(projects.order)
  },
  
  async findBySlug(slug: string) {
    const [project] = await db.select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1)
    
    return project
  },
  
  async findByCategory(category: string) {
    return await db.select()
      .from(projects)
      .where(sql`${category} = ANY(${projects.categories})`)
      .orderBy(projects.order)
  },
  
  async create(project: NewProject) {
    const [result] = await db.insert(projects)
      .values(project)
      .returning()
    
    return result
  },
  
  async update(slug: string, project: Partial<Omit<NewProject, 'createdAt'>>) {
    const [result] = await db.update(projects)
      .set({
        ...project,
        updatedAt: new Date()
      })
      .where(eq(projects.slug, slug))
      .returning()
    
    return result
  },
  
  async delete(slug: string) {
    return await db.delete(projects)
      .where(eq(projects.slug, slug))
  }
}

export const cryptoProjectsRepository = {
  async findAll() {
    return await db.select()
      .from(cryptoProjects)
      .orderBy(cryptoProjects.id)
  },
  
  async findBySlug(slug: string) {
    const [project] = await db.select()
      .from(cryptoProjects)
      .where(eq(cryptoProjects.slug, slug))
      .limit(1)
    
    return project
  },
  
  async create(project: NewCryptoProject) {
    const [result] = await db.insert(cryptoProjects)
      .values(project)
      .returning()
    
    return result
  },
  
  async update(slug: string, project: Partial<Omit<NewCryptoProject, 'createdAt'>>) {
    const [result] = await db.update(cryptoProjects)
      .set({
        ...project,
        updatedAt: new Date()
      })
      .where(eq(cryptoProjects.slug, slug))
      .returning()
    
    return result
  },
  
  async delete(slug: string) {
    return await db.delete(cryptoProjects)
      .where(eq(cryptoProjects.slug, slug))
  }
}