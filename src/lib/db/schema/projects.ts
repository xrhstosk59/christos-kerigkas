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
  primaryKey,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Ορισμός του string literal type για τα project statuses
export type ProjectStatus = 'active' | 'inactive' | 'archived' | 'featured' | 'completed' | 'in-progress';

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  // Οι κατηγορίες ως array χρησιμοποιούνται μόνο για caching
  categories: text('categories').array().notNull(),
  // Οι τεχνολογίες ως array χρησιμοποιούνται μόνο για caching
  tech: text('tech').array().notNull(),
  github: varchar('github', { length: 255 }).notNull(),
  demo: varchar('demo', { length: 255 }),
  image: varchar('image', { length: 255 }).notNull(),
  images: jsonb('images'),
  // Χρήση varchar αντί για enum για συμβατότητα
  status: varchar('status', { length: 50 }).default('active').notNull(),
  featured: boolean('featured').default(false),
  order: serial('order'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Προσθήκη index στο slug για γρηγορότερες αναζητήσεις με το slug
    slugIdx: index('projects_slug_idx').on(table.slug),
    // Προσθήκη index στο status για φιλτράρισμα με βάση το status
    statusIdx: index('projects_status_idx').on(table.status),
    // Προσθήκη index στο featured για γρηγορότερες αναζητήσεις προτεινόμενων projects
    featuredIdx: index('projects_featured_idx').on(table.featured),
    // Προσθήκη index στο order για γρηγορότερη ταξινόμηση
    orderIdx: index('projects_order_idx').on(table.order)
  }
});

// Κανονικοποίηση του σχήματος με ξεχωριστό πίνακα για τεχνολογίες
export const projectTechnologies = pgTable('project_technologies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }), // e.g., 'frontend', 'backend', 'database'
  iconUrl: varchar('icon_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('project_technologies_name_idx').on(table.name),
    categoryIdx: index('project_technologies_category_idx').on(table.category)
  }
});

// Πίνακας σύνδεσης projects και technologies (many-to-many relationship)
export const projectsToTech = pgTable('projects_to_tech', {
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  technologyId: integer('technology_id')
    .notNull()
    .references(() => projectTechnologies.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.projectId, table.technologyId] }),
    projectIdx: index('projects_to_tech_project_idx').on(table.projectId),
    techIdx: index('projects_to_tech_tech_idx').on(table.technologyId)
  }
});

// Project categories table
export const projectCategories = pgTable('project_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('project_categories_slug_idx').on(table.slug),
    nameIdx: index('project_categories_name_idx').on(table.name)
  }
});

// Project to category junction table (many-to-many)
export const projectsToCategories = pgTable('projects_to_categories', {
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => projectCategories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.projectId, table.categoryId] }),
    projectIdx: index('projects_to_categories_project_idx').on(table.projectId),
    categoryIdx: index('projects_to_categories_category_idx').on(table.categoryId)
  }
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
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('crypto_projects_slug_idx').on(table.slug),
    statusIdx: index('crypto_projects_status_idx').on(table.status)
  }
});

// Relations - πρόσθετο στοιχείο από το νέο Drizzle API
export const projectsRelations = relations(projects, ({ many }) => ({
  technologies: many(projectsToTech),
  categories: many(projectsToCategories)
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ many }) => ({
  projects: many(projectsToTech)
}));

export const projectCategoriesRelations = relations(projectCategories, ({ many }) => ({
  projects: many(projectsToCategories)
}));

export const projectsToTechRelations = relations(projectsToTech, ({ one }) => ({
  project: one(projects, {
    fields: [projectsToTech.projectId],
    references: [projects.id]
  }),
  technology: one(projectTechnologies, {
    fields: [projectsToTech.technologyId],
    references: [projectTechnologies.id]
  })
}));

export const projectsToCategoriesRelations = relations(projectsToCategories, ({ one }) => ({
  project: one(projects, {
    fields: [projectsToCategories.projectId],
    references: [projects.id]
  }),
  category: one(projectCategories, {
    fields: [projectsToCategories.categoryId],
    references: [projectCategories.id]
  })
}));

// Zod schema για τα projects
export const projectSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(3).max(100),
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  shortDescription: z.string().optional().nullable(),
  categories: z.array(z.string()),
  tech: z.array(z.string()),
  github: z.string().url(),
  demo: z.string().url().optional().nullable(),
  image: z.string().min(3),
  images: z.array(z.string()).optional().nullable(),
  status: z.string().default('active'),
  featured: z.boolean().default(false),
  order: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Zod schema για τις κατηγορίες project
export const projectCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Zod schema για τις τεχνολογίες
export const projectTechnologySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(100),
  category: z.string().max(50).optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  createdAt: z.date().optional(),
});

// Zod schema για τα crypto projects
export const cryptoProjectSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(3).max(100),
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  features: z.array(z.string()),
  tech: z.array(z.string()),
  github: z.string().url(),
  status: z.string().default('active'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Export types
export type Project = z.infer<typeof projectSchema>;
export type NewProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'order'>;
export type SelectProject = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type ProjectCategory = z.infer<typeof projectCategorySchema>;
export type NewProjectCategory = Omit<ProjectCategory, 'id' | 'createdAt' | 'updatedAt'>;
export type SelectProjectCategory = typeof projectCategories.$inferSelect;
export type InsertProjectCategory = typeof projectCategories.$inferInsert;

export type ProjectTechnology = z.infer<typeof projectTechnologySchema>;
export type NewProjectTechnology = Omit<ProjectTechnology, 'id' | 'createdAt'>;
export type SelectProjectTechnology = typeof projectTechnologies.$inferSelect;
export type InsertProjectTechnology = typeof projectTechnologies.$inferInsert;

export type CryptoProject = z.infer<typeof cryptoProjectSchema>;
export type NewCryptoProject = Omit<CryptoProject, 'id' | 'createdAt' | 'updatedAt'>;
export type SelectCryptoProject = typeof cryptoProjects.$inferSelect;
export type InsertCryptoProject = typeof cryptoProjects.$inferInsert;