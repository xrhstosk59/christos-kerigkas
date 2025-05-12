// src/lib/db/schema/blog.ts

import { pgTable, serial, varchar, text, timestamp, jsonb, boolean as pgBoolean } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Ορισμός του schema του πίνακα blog_categories
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schema για τις κατηγορίες blog
export const blogCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Τύποι για τις κατηγορίες blog
export type BlogCategory = z.infer<typeof blogCategorySchema>;
export type NewBlogCategory = Omit<BlogCategory, 'id'>;
export type SelectBlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;

// Ορισμός του schema του πίνακα blog_posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  image: varchar('image', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorImage: varchar('author_image', { length: 255 }),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Αποθήκευση των κατηγοριών ως πίνακας σε JSON μορφή
  categories: jsonb('categories').$type<string[]>().default(['general']),
  
  // Αποθήκευση του excerpt ως ξεχωριστό πεδίο
  excerpt: text('excerpt'),
  
  // Μετα-δεδομένα για SEO
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  
  // Flags για τη διαχείριση των posts
  published: pgBoolean('published').default(true),
  featured: pgBoolean('featured').default(false),
  
  // Κατηγορία ως string για συμβατότητα με υπάρχοντα κώδικα
  category: varchar('category', { length: 100 }).default('general'),
});

// Zod schema για τα blog posts
// Αυτό χρησιμοποιείται για επικύρωση δεδομένων
export const blogPostSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(3).max(255),
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  content: z.string().min(10),
  image: z.string().url().optional().nullable(),
  authorName: z.string().min(2),
  authorImage: z.string().url().optional().nullable(),
  date: z.date(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  categories: z.array(z.string()).default(['general']),
  excerpt: z.string().optional().nullable(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  category: z.string().default('general'),
});

// Τύποι TypeScript για χρήση στον υπόλοιπο κώδικα
export type BlogPost = z.infer<typeof blogPostSchema>;
export type NewBlogPost = Omit<BlogPost, 'id'>;
// Προσθήκη τύπων για τις επιλογές και εισαγωγές στη βάση
export type SelectBlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;