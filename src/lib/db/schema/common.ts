// src/lib/db/schema/common.ts
import { timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core';

// Κοινοί τύποι και enums για χρήση σε όλο το schema

// Status enum για διάφορους πίνακες
export const statusEnum = pgEnum('status', [
  'new',
  'pending',
  'processing',
  'completed',
  'failed',
  'canceled'
]);

// Enum για τύπους πιστοποιήσεων
export const certificateTypeEnum = pgEnum('certificate_type', [
  'course',
  'certification',
  'degree',
  'award',
  'other'
]);

// Enum για project status
export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'inactive',
  'archived',
  'featured',
  'completed',
  'in-progress'
]);

// Κοινά πεδία για timestamps - μπορούν να χρησιμοποιηθούν ως βοηθητικά για πίνακες
export const timestampFields = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at')
};

// Κοινά πεδία για slugs - μπορούν να χρησιμοποιηθούν ως βοηθητικά για πίνακες που χρειάζονται slug
export const slugField = {
  slug: varchar('slug', { length: 255 }).notNull().unique()
};