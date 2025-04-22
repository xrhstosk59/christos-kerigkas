// src/lib/db/schema.ts
import { pgTable, serial, text, timestamp, varchar, boolean, jsonb } from 'drizzle-orm/pg-core'

// Contact messages table
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  categories: text('categories').array().notNull(),
  tech: text('tech').array().notNull(),
  github: varchar('github', { length: 255 }).notNull(),
  demo: varchar('demo', { length: 255 }),
  image: varchar('image', { length: 255 }).notNull(),
  images: jsonb('images'),
  featured: boolean('featured').default(false),
  order: serial('order'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Crypto projects table
export const cryptoProjects = pgTable('crypto_projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  features: text('features').array().notNull(),
  tech: text('tech').array().notNull(),
  github: varchar('github', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Export types
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type CryptoProject = typeof cryptoProjects.$inferSelect
export type NewCryptoProject = typeof cryptoProjects.$inferInsert