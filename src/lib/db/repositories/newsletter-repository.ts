// src/lib/db/repositories/newsletter-repository.ts
import { db } from '@/lib/db'
import { newsletterSubscribers, type NewNewsletterSubscriber } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const newsletterRepository = {
  async subscribe(subscriber: NewNewsletterSubscriber) {
    const [result] = await db.insert(newsletterSubscribers)
      .values(subscriber)
      .returning()
    
    return result
  },
  
  async unsubscribe(email: string) {
    await db.update(newsletterSubscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date()
      })
      .where(eq(newsletterSubscribers.email, email))
  },
  
  async isSubscribed(email: string): Promise<boolean> {
    const result = await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1)
    
    return result.length > 0
  },
  
  async getAll(includeUnsubscribed = false) {
    const query = db.select().from(newsletterSubscribers)
    
    if (!includeUnsubscribed) {
      return query.where(eq(newsletterSubscribers.isActive, true))
    }
    
    return query
  }
}