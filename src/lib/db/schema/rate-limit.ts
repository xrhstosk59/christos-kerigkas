// src/lib/db/schema/rate-limit.ts
import { pgTable, varchar, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Rate Limit Attempts Table
export const rateLimitAttempts = pgTable('rate_limit_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }).default('general'),
  attempts: integer('attempts').default(1),
  resetTime: timestamp('reset_time', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  // Indexes για performance
  identifierEndpointIdx: index('idx_rate_limit_identifier_endpoint')
    .on(table.identifier, table.endpoint),
  resetTimeIdx: index('idx_rate_limit_reset_time')
    .on(table.resetTime),
  createdAtIdx: index('idx_rate_limit_created_at')
    .on(table.createdAt),
}));

// Zod schemas για validation
export const insertRateLimitAttemptSchema = createInsertSchema(rateLimitAttempts);
export const selectRateLimitAttemptSchema = createSelectSchema(rateLimitAttempts);

// Types
export type RateLimitAttempt = typeof rateLimitAttempts.$inferSelect;
export type NewRateLimitAttempt = typeof rateLimitAttempts.$inferInsert;

// Enum για endpoints (για type safety)
export const RateLimitEndpoint = {
  GENERAL: 'general',
  AUTH_LOGIN: 'auth_login',
  AUTH_REGISTER: 'auth_register',
  CONTACT_FORM: 'contact_form',
  NEWSLETTER: 'newsletter',
  API_GENERAL: 'api_general',
  FILE_UPLOAD: 'file_upload',
  ADMIN_ACTIONS: 'admin_actions',
} as const;

export type RateLimitEndpointType = typeof RateLimitEndpoint[keyof typeof RateLimitEndpoint];