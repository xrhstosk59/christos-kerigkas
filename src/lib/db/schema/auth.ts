// src/lib/db/schema/auth.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    uuid,
    index,
  } from 'drizzle-orm/pg-core';
  
  // Users table (για το Supabase Auth)
  export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    role: text('role').notNull().default('user'),
  }, (table) => {
    return {
      emailIdx: index('email_idx').on(table.email),
    }
  });
  
  // User profiles table
  export const userProfiles = pgTable('user_profiles', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    bio: text('bio'),
    avatarUrl: varchar('avatar_url', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  
  // Export types
  export type User = typeof users.$inferSelect;
  export type NewUser = typeof users.$inferInsert;
  
  export type UserProfile = typeof userProfiles.$inferSelect;
  export type NewUserProfile = typeof userProfiles.$inferInsert;