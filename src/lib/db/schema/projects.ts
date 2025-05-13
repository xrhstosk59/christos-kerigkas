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
}, (table) => {
  return {
    // Προσθήκη index στο slug για γρηγορότερες αναζητήσεις με το slug
    slugIdx: index('projects_slug_idx').on(table.slug),
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
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  technologyId: integer('technology_id').notNull().references(() => projectTechnologies.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    // Διόρθωση - Χρήση του primaryKey με σωστή σύνταξη
    pk: primaryKey({ columns: [table.projectId, table.technologyId] }),
    projectIdx: index('projects_to_tech_project_idx').on(table.projectId),
    techIdx: index('projects_to_tech_tech_idx').on(table.technologyId)
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
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('crypto_projects_slug_idx').on(table.slug),
    statusIdx: index('crypto_projects_status_idx').on(table.status)
  }
});

// Project categories table
export const projectCategories = pgTable('project_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
}, (table) => {
  return {
    slugIdx: index('project_categories_slug_idx').on(table.slug),
    nameIdx: index('project_categories_name_idx').on(table.name)
  }
});

// Project to category junction table (many-to-many)
export const projectsToCategories = pgTable('projects_to_categories', {
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => projectCategories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    // Διόρθωση - Χρήση του primaryKey με σωστή σύνταξη
    pk: primaryKey({ columns: [table.projectId, table.categoryId] }),
    projectIdx: index('projects_to_categories_project_idx').on(table.projectId),
    categoryIdx: index('projects_to_categories_category_idx').on(table.categoryId)
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

// Export types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type CryptoProject = typeof cryptoProjects.$inferSelect;
export type NewCryptoProject = typeof cryptoProjects.$inferInsert;

export type ProjectCategory = typeof projectCategories.$inferSelect;
export type NewProjectCategory = typeof projectCategories.$inferInsert;

export type ProjectTechnology = typeof projectTechnologies.$inferSelect;
export type NewProjectTechnology = typeof projectTechnologies.$inferInsert;