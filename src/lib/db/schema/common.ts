// src/lib/db/schema/common.ts
import { timestamp, varchar, pgEnum, index } from 'drizzle-orm/pg-core';

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

// Τύπος για τα table objects του Drizzle για να αποφύγουμε το any
type DrizzleTable = {
  slug: { name: string };
  createdAt?: { name: string };
  updatedAt?: { name: string };
};

// Βοηθητική συνάρτηση για δημιουργία index στο slug
export function createSlugIndex(table: DrizzleTable, tableName: string) {
  return index(`${tableName}_slug_idx`).on(table.slug);
}

// Βοηθητική συνάρτηση για δημιουργία indexes σε timestamp πεδία
export function createTimestampIndexes(table: DrizzleTable, tableName: string) {
  if (!table.createdAt || !table.updatedAt) {
    throw new Error(`Table ${tableName} doesn't have timestamp fields`);
  }
  
  return {
    createdAtIdx: index(`${tableName}_created_at_idx`).on(table.createdAt),
    updatedAtIdx: index(`${tableName}_updated_at_idx`).on(table.updatedAt)
  };
}

// Βοηθητική συνάρτηση για δημιουργία slug από string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Αφαίρεση ειδικών χαρακτήρων
    .replace(/[\s_]+/g, '-')  // Αντικατάσταση κενών και underscores με παύλες
    .replace(/^-+|-+$/g, ''); // Αφαίρεση παυλών από την αρχή και το τέλος
}