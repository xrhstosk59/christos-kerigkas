// src/lib/db/schema/contact.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    boolean,
    uuid
  } from 'drizzle-orm/pg-core';
  import { users } from './auth';
  
  // Contact messages table
  export const contactMessages = pgTable('contact_messages', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    message: text('message').notNull(),
    ipAddress: varchar('ip_address', { length: 50 }),
    status: varchar('status', { length: 20 }).notNull().default('new'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    respondedAt: timestamp('responded_at'),
    respondedById: uuid('responded_by_id').references(() => users.id),
  });
  
  // Newsletter subscribers table
  export const newsletterSubscribers = pgTable('newsletter_subscribers', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
    ipAddress: varchar('ip_address', { length: 50 }),
    isActive: boolean('is_active').default(true).notNull(),
    unsubscribedAt: timestamp('unsubscribed_at'),
  });
  
  // Export types
  export type ContactMessage = typeof contactMessages.$inferSelect;
  export type NewContactMessage = typeof contactMessages.$inferInsert;
  
  export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
  export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;