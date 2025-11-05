// src/lib/db/repositories/newsletter-repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';

// Types based on Supabase schema
type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];
type NewNewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Insert'];

export const newsletterRepository = {
  async subscribe(subscriber: NewNewsletterSubscriber): Promise<NewsletterSubscriber | null> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert(subscriber)
      .select()
      .single();

    if (error) {
      console.error('Error subscribing to newsletter:', error);
      return null;
    }

    return data;
  },

  async unsubscribe(email: string): Promise<void> {
    const supabase = await ensureDatabaseConnection();

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error unsubscribing from newsletter:', error);
    }
  },

  async isSubscribed(email: string): Promise<boolean> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  },

  async getAll(includeUnsubscribed = false): Promise<NewsletterSubscriber[]> {
    const supabase = await ensureDatabaseConnection();

    let query = supabase
      .from('newsletter_subscribers')
      .select('*');

    if (!includeUnsubscribed) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return [];
    }

    return data || [];
  }
};

// Export types for convenience
export type { NewsletterSubscriber, NewNewsletterSubscriber };
