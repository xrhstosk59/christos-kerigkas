// src/lib/db/repositories/contact-repository.ts
import { db } from '@/lib/db'
import { contactMessages, type NewContactMessage } from '@/lib/db/schema'
import { desc, eq, count } from 'drizzle-orm'

export const contactRepository = {
  async create(message: NewContactMessage) {
    try {
      console.log('Repository: Creating contact message', message.name);
      
      // Διασφαλίζουμε ότι το db είναι διαθέσιμο
      if (!db) {
        console.error('Repository: Database connection not available');
        throw new Error('Database connection not available');
      }
      
      // Βεβαιωνόμαστε ότι το ipAddress έχει τιμή, ακόμα και αν είναι προαιρετικό στο schema
      const messageToSave = {
        ...message,
        ipAddress: message.ipAddress || 'unknown',
        status: 'new' // Θέτουμε το status σε 'new' εφόσον είναι νέο μήνυμα
      };
      
      const [result] = await db.insert(contactMessages)
        .values(messageToSave)
        .returning();
      
      console.log('Repository: Message created successfully with ID:', result?.id);
      return result;
    } catch (error) {
      console.error('Repository: Error creating contact message:', error);
      throw error;
    }
  },
  
  async findAll(page: number = 1, limit: number = 10) {
    try {
      if (!db) {
        console.error('Repository: Database connection not available');
        throw new Error('Database connection not available');
      }
      
      const offset = (page - 1) * limit;
      
      const messages = await db.select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt))
        .limit(limit)
        .offset(offset);
      
      const [result] = await db
        .select({ total: count() })
        .from(contactMessages);
      
      const total = Number(result.total);
      
      return {
        messages,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Repository: Error finding contact messages:', error);
      throw error;
    }
  },
  
  async delete(id: number) {
    try {
      if (!db) {
        console.error('Repository: Database connection not available');
        throw new Error('Database connection not available');
      }
      
      return db.delete(contactMessages)
        .where(eq(contactMessages.id, id));
    } catch (error) {
      console.error('Repository: Error deleting contact message:', error);
      throw error;
    }
  }
}