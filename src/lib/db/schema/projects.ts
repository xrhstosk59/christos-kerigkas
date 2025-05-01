// src/lib/db/schema/projects.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    boolean,
    jsonb,
    integer,
    primaryKey
  } from 'drizzle-orm/pg-core';
  
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
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  
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
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  
  // Project categories table
  export const projectCategories = pgTable('project_categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
  });
  
  // Project to category junction table (many-to-many)
  export const projectsToCategories = pgTable('projects_to_categories', {
    projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => projectCategories.id, { onDelete: 'cascade' }),
  }, (table) => {
    return {
      pk: primaryKey(table.projectId, table.categoryId),
    }
  });
  
  // Export types
  export type Project = typeof projects.$inferSelect;
  export type NewProject = typeof projects.$inferInsert;
  
  export type CryptoProject = typeof cryptoProjects.$inferSelect;
  export type NewCryptoProject = typeof cryptoProjects.$inferInsert;
  
  export type ProjectCategory = typeof projectCategories.$inferSelect;
  export type NewProjectCategory = typeof projectCategories.$inferInsert;