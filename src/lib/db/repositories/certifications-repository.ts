// src/lib/db/repositories/certifications-repository.ts
import { certifications, type NewCertification, type Certification } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { desc, eq, sql } from 'drizzle-orm'

export const certificationsRepository = {
  async findAll(): Promise<Certification[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(certifications)
      .orderBy(desc(certifications.issueDate));
  },
  
  async findFeatured(): Promise<Certification[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(certifications)
      .where(eq(certifications.featured, true))
      .orderBy(desc(certifications.issueDate));
  },
  
  async findById(id: string): Promise<Certification | undefined> {
    const database = ensureDatabaseConnection();
    const [certification] = await database.select()
      .from(certifications)
      .where(eq(certifications.id, id))
      .limit(1);
    
    return certification;
  },
  
  async findByType(type: string): Promise<Certification[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(certifications)
      .where(eq(certifications.type, type))
      .orderBy(desc(certifications.issueDate));
  },
  
  async findBySkill(skill: string): Promise<Certification[]> {
    const database = ensureDatabaseConnection();
    return database.select()
      .from(certifications)
      .where(sql`${skill} = ANY(${certifications.skills})`)
      .orderBy(desc(certifications.issueDate));
  },
  
  async create(certification: NewCertification): Promise<Certification> {
    const database = ensureDatabaseConnection();
    const [result] = await database.insert(certifications)
      .values(certification)
      .returning();
    
    return result;
  },
  
  async update(id: string, certification: Partial<Omit<NewCertification, 'createdAt'>>): Promise<Certification | undefined> {
    const database = ensureDatabaseConnection();
    const [result] = await database.update(certifications)
      .set({
        ...certification,
        updatedAt: new Date()
      })
      .where(eq(certifications.id, id))
      .returning();
    
    return result;
  },
  
  async delete(id: string): Promise<void> {
    const database = ensureDatabaseConnection();
    await database.delete(certifications)
      .where(eq(certifications.id, id));
  }
}