// src/lib/db/schema/auth.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    uuid,
    index,
    boolean,
  } from 'drizzle-orm/pg-core';
  
  // Users table (για το Supabase Auth)
  export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    role: text('role').notNull().default('user'),
    // Two-Factor Authentication fields
    twoFactorEnabled: boolean('two_factor_enabled').default(false),
    twoFactorSecret: text('two_factor_secret'), // Base32 encoded secret
    twoFactorBackupCodes: text('two_factor_backup_codes'), // JSON array of backup codes
  }, (table) => {
    return {
      emailIdx: index('email_idx').on(table.email),
      twoFactorIdx: index('two_factor_idx').on(table.twoFactorEnabled),
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