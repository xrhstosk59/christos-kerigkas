// src/lib/db/repositories/certifications-repository.ts
import { db } from '@/lib/db'
import { certifications, type NewCertification } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'

export const certificationsRepository = {
  async findAll() {
    return db.select()
      .from(certifications)
      .orderBy(desc(certifications.issueDate))
  },
  
  async findFeatured() {
    return db.select()
      .from(certifications)
      .where(eq(certifications.featured, true))
      .orderBy(desc(certifications.issueDate))
  },
  
  async findById(id: string) {
    const [certification] = await db.select()
      .from(certifications)
      .where(eq(certifications.id, id))
      .limit(1)
    
    return certification
  },
  
  async findByType(type: string) {
    return db.select()
      .from(certifications)
      .where(eq(certifications.type, type))
      .orderBy(desc(certifications.issueDate))
  },
  
  async findBySkill(skill: string) {
    return db.select()
      .from(certifications)
      .where(sql`${skill} = ANY(${certifications.skills})`)
      .orderBy(desc(certifications.issueDate))
  },
  
  async create(certification: NewCertification) {
    const [result] = await db.insert(certifications)
      .values(certification)
      .returning()
    
    return result
  },
  
  async update(id: string, certification: Partial<Omit<NewCertification, 'createdAt'>>) {
    const [result] = await db.update(certifications)
      .set({
        ...certification,
        updatedAt: new Date()
      })
      .where(eq(certifications.id, id))
      .returning()
    
    return result
  },
  
  async delete(id: string) {
    return db.delete(certifications)
      .where(eq(certifications.id, id))
  }
}