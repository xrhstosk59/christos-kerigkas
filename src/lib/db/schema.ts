// src/lib/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
  index,
  uuid,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core'
// Αφαιρέσαμε το foreignKey και το sql από τις εισαγωγές καθώς δεν χρησιμοποιούνται

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
})

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
})

// Blog categories table
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Blog posts table
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  image: varchar('image', { length: 255 }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorImage: varchar('author_image', { length: 255 }).notNull(),
  categories: text('categories').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('slug_idx').on(table.slug),
    dateIdx: index('date_idx').on(table.date),
    authorIdIdx: index('author_id_idx').on(table.authorId),
  }
})

// Blog post to category junction table (many-to-many)
export const blogPostsToCategories = pgTable('blog_posts_to_categories', {
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => blogCategories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey(table.postId, table.categoryId),
  }
})

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
})

// Newsletter subscribers table
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
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
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Project categories table
export const projectCategories = pgTable('project_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
})

// Project to category junction table (many-to-many)
export const projectsToCategories = pgTable('projects_to_categories', {
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => projectCategories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey(table.projectId, table.categoryId),
  }
})

// Certifications table
export const certifications = pgTable('certifications', {
  id: varchar('id', { length: 100 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  issuer: varchar('issuer', { length: 255 }).notNull(),
  issueDate: timestamp('issue_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  credentialId: varchar('credential_id', { length: 100 }),
  credentialUrl: varchar('credential_url', { length: 255 }),
  description: text('description'),
  skills: text('skills').array(),
  type: varchar('type', { length: 50 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Skills table
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull(),
})

// Certification to skill junction table (many-to-many)
export const certificationsToSkills = pgTable('certifications_to_skills', {
  certificationId: varchar('certification_id', { length: 100 }).notNull().references(() => certifications.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey(table.certificationId, table.skillId),
  }
})

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert

export type BlogCategory = typeof blogCategories.$inferSelect
export type NewBlogCategory = typeof blogCategories.$inferInsert

export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert

export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type CryptoProject = typeof cryptoProjects.$inferSelect
export type NewCryptoProject = typeof cryptoProjects.$inferInsert

export type ProjectCategory = typeof projectCategories.$inferSelect
export type NewProjectCategory = typeof projectCategories.$inferInsert

export type Certification = typeof certifications.$inferSelect
export type NewCertification = typeof certifications.$inferInsert

export type Skill = typeof skills.$inferSelect
export type NewSkill = typeof skills.$inferInsert