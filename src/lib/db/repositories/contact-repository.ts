// src/lib/db/repositories/contact-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';

// Types based on Supabase schema
type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
type NewContactMessage = Database['public']['Tables']['contact_messages']['Insert'];

export const contactRepository = {
  async create(message: NewContactMessage) {
    try {
      console.log('Repository: Creating contact message', message.name);

      const supabase = await ensureDatabaseConnection();

      // Ensure ipAddress has a value
      const messageToSave = {
        ...message,
        ip_address: message.ip_address || 'unknown',
        status: 'new' // Set status to 'new' for new messages
      };

      const { data, error } = await supabase
        .from('contact_messages')
        .insert(messageToSave)
        .select()
        .single();

      if (error) {
        console.error('Repository: Error creating contact message:', error);
        throw error;
      }

      console.log('Repository: Message created successfully with ID:', data?.id);
      return data;
    } catch (error) {
      console.error('Repository: Error creating contact message:', error);
      throw error;
    }
  },

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const supabase = await ensureDatabaseConnection();

      const offset = (page - 1) * limit;

      // Get paginated messages
      const { data: messages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (messagesError) {
        console.error('Repository: Error finding contact messages:', messagesError);
        throw messagesError;
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Repository: Error counting contact messages:', countError);
        throw countError;
      }

      const total = count || 0;

      return {
        messages: messages || [],
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
      const supabase = await ensureDatabaseConnection();

      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Repository: Error deleting contact message:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Repository: Error deleting contact message:', error);
      throw error;
    }
  }
};

// Export types for convenience
export type { ContactMessage, NewContactMessage };
