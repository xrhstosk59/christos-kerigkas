// src/lib/db/repositories/contact-repository.ts
import { db } from '@/lib/db'
import { contactMessages, type NewContactMessage } from '@/lib/db/schema'
import { desc, eq, count } from 'drizzle-orm'

export const contactRepository = {
  async create(message: NewContactMessage) {
    const [result] = await db.insert(contactMessages)
      .values(message)
      .returning()
    
    return result
  },
  
  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit
    
    const messages = await db.select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset)
    
    const [result] = await db
      .select({ total: count() })
      .from(contactMessages)
    
    const total = Number(result.total)
    
    return {
      messages,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  },
  
  async delete(id: number) {
    return db.delete(contactMessages)
      .where(eq(contactMessages.id, id))
  }
}