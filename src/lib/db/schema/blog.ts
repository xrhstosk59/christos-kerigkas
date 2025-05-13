// src/lib/db/schema/blog.ts

import { pgTable, serial, varchar, text, timestamp, jsonb, boolean as pgBoolean, index, primaryKey } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Ορισμός του schema του πίνακα blog_categories
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    // Προσθήκη index στο slug για γρηγορότερες αναζητήσεις
    slugIdx: index('blog_categories_slug_idx').on(table.slug),
    // Προσθήκη index στο name για γρηγορότερες αναζητήσεις με το όνομα
    nameIdx: index('blog_categories_name_idx').on(table.name)
  }
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
}, (table) => {
  return {
    // Προσθήκη index στο slug για γρηγορότερες αναζητήσεις με το slug
    slugIdx: index('blog_posts_slug_idx').on(table.slug),
    // Προσθήκη index στο category για γρηγορότερες αναζητήσεις με κατηγορία
    categoryIdx: index('blog_posts_category_idx').on(table.category),
    // Προσθήκη composite index για published + featured για γρηγορότερες αναζητήσεις δημοσιευμένων & προτεινόμενων άρθρων
    publishedFeaturedIdx: index('blog_posts_published_featured_idx').on(table.published, table.featured),
    // Προσθήκη index στο date για γρηγορότερη ταξινόμηση και αναζήτηση με ημερομηνία
    dateIdx: index('blog_posts_date_idx').on(table.date),
    // Προσθήκη index στο author_name για γρηγορότερη αναζήτηση με συγγραφέα
    authorNameIdx: index('blog_posts_author_name_idx').on(table.authorName)
  }
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

// Προσθήκη ενός πίνακα για τα tags για μελλοντική χρήση
export const blogTags = pgTable('blog_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('blog_tags_slug_idx').on(table.slug)
  }
});

// Πίνακας σύνδεσης posts και tags (many-to-many relationship)
export const blogPostsTags = pgTable('blog_posts_tags', {
  postId: serial('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: serial('tag_id').references(() => blogTags.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    // Διόρθωση - Χρήση του primaryKey αντί για index().primaryKey()
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    // Index για γρηγορότερη αναζήτηση με tag
    tagIdx: index('blog_posts_tags_tag_idx').on(table.tagId)
  }
});