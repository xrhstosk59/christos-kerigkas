// src/lib/db/repositories/newsletter-repository.ts
import { newsletterSubscribers, type NewNewsletterSubscriber, type NewsletterSubscriber } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';

type TypedDatabase = PostgresJsDatabase<typeof schema>;

export const newsletterRepository = {
  async subscribe(subscriber: NewNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const database = ensureDatabaseConnection();
    
    // Χρησιμοποιούμε τυποποιημένες λειτουργίες αντί για να βασιζόμαστε στην επιστροφή της ensureDatabaseConnection
    const [result] = await database.insert(newsletterSubscribers)
      .values(subscriber)
      .returning() as NewsletterSubscriber[];
    
    return result;
  },
  
  async unsubscribe(email: string): Promise<void> {
    const database = ensureDatabaseConnection();
    
    // Ρητή τυποποίηση
    await (database as TypedDatabase).update(newsletterSubscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date()
      })
      .where(eq(newsletterSubscribers.email, email));
  },
  
  async isSubscribed(email: string): Promise<boolean> {
    const database = ensureDatabaseConnection();
    
    // Ρητή τυποποίηση της επιστροφής
    const result = await (database as TypedDatabase).select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);
    
    return result.length > 0;
  },
  
  async getAll(includeUnsubscribed = false): Promise<NewsletterSubscriber[]> {
    const database = ensureDatabaseConnection();
    
    // Δημιουργία του αρχικού ερωτήματος με ρητό τύπο
    const query = (database as TypedDatabase).select().from(newsletterSubscribers);
    
    if (!includeUnsubscribed) {
      return await query.where(eq(newsletterSubscribers.isActive, true)) as NewsletterSubscriber[];
    }
    
    return await query as NewsletterSubscriber[];
  }
}