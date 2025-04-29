// src/lib/db/repositories/newsletter-repository.ts
import { newsletterSubscribers, type NewNewsletterSubscriber, type NewsletterSubscriber } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { eq } from 'drizzle-orm'

export const newsletterRepository = {
  async subscribe(subscriber: NewNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const database = ensureDatabaseConnection();
    const [result] = await database.insert(newsletterSubscribers)
      .values(subscriber)
      .returning();
    
    return result;
  },
  
  async unsubscribe(email: string): Promise<void> {
    const database = ensureDatabaseConnection();
    await database.update(newsletterSubscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date()
      })
      .where(eq(newsletterSubscribers.email, email));
  },
  
  async isSubscribed(email: string): Promise<boolean> {
    const database = ensureDatabaseConnection();
    const result = await database.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);
    
    return result.length > 0;
  },
  
  async getAll(includeUnsubscribed = false): Promise<NewsletterSubscriber[]> {
    const database = ensureDatabaseConnection();
    const query = database.select().from(newsletterSubscribers);
    
    if (!includeUnsubscribed) {
      return query.where(eq(newsletterSubscribers.isActive, true));
    }
    
    return query;
  }
}