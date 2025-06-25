// src/lib/db/schema/blog.ts

import { pgTable, serial, varchar, text, timestamp, jsonb, boolean as pgBoolean, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
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
  
  // Αποθήκευση του status ως varchar αντί για enum για συμβατότητα
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  
  // Αποθήκευση των κατηγοριών ως πίνακας σε JSON μορφή (caching)
  categories: jsonb('categories').$type<string[]>().default(['general']),
  
  // Αποθήκευση του excerpt ως ξεχωριστό πεδίο για SEO
  excerpt: text('excerpt'),
  
  // Μετα-δεδομένα για SEO
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  
  // Flags για τη διαχείριση των posts
  published: pgBoolean('published').default(true),
  featured: pgBoolean('featured').default(false),
  
  // View count για tracking δημοτικότητας
  views: serial('views').default(0),
  
  // Reading time σε λεπτά (υπολογίζεται αυτόματα)
  readingTime: serial('reading_time').default(1),
  
  // Κατηγορία ως string για συμβατότητα με υπάρχοντα κώδικα - θα καταργηθεί
  category: varchar('category', { length: 100 }).default('general'),
}, (table) => {
  return {
    // Προσθήκη index στο slug για γρηγορότερες αναζητήσεις με το slug
    slugIdx: index('blog_posts_slug_idx').on(table.slug),
    // Προσθήκη index στο status για φιλτράρισμα με βάση το status
    statusIdx: index('blog_posts_status_idx').on(table.status),
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

// Πίνακας για τα tags των blog posts
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
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    // Index για γρηγορότερη αναζήτηση με tag
    tagIdx: index('blog_posts_tags_tag_idx').on(table.tagId),
    // Index για γρηγορότερη αναζήτηση με post
    postIdx: index('blog_posts_tags_post_idx').on(table.postId)
  }
});

// Πίνακας συσχέτισης posts και κατηγοριών
export const blogPostsToCategories = pgTable('blog_posts_to_categories', {
  postId: serial('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  categoryId: serial('category_id').references(() => blogCategories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.postId, table.categoryId] }),
    postIdx: index('blog_posts_to_categories_post_idx').on(table.postId),
    categoryIdx: index('blog_posts_to_categories_category_idx').on(table.categoryId)
  }
});

// Ορισμός των σχέσεων
export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  categories: many(blogPostsToCategories),
  tags: many(blogPostsTags)
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPostsToCategories)
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostsTags)
}));

export const blogPostsToCategoriesRelations = relations(blogPostsToCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostsToCategories.postId],
    references: [blogPosts.id]
  }),
  category: one(blogCategories, {
    fields: [blogPostsToCategories.categoryId],
    references: [blogCategories.id]
  })
}));

export const blogPostsTagsRelations = relations(blogPostsTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostsTags.postId],
    references: [blogPosts.id]
  }),
  tag: one(blogTags, {
    fields: [blogPostsTags.tagId],
    references: [blogTags.id]
  })
}));

// Zod schema για τα blog posts
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
  status: z.string().default('draft'),
  categories: z.array(z.string()).default(['general']),
  excerpt: z.string().optional().nullable(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  views: z.number().default(0),
  readingTime: z.number().default(1),
  category: z.string().default('general'),
});

// Τύποι TypeScript για χρήση στον υπόλοιπο κώδικα
export type BlogPost = z.infer<typeof blogPostSchema>;
export type NewBlogPost = Omit<BlogPost, 'id'>;
export type SelectBlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Zod schema για τα blog tags
export const blogTagSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  createdAt: z.date().optional(),
});

// Τύποι TypeScript για τα tags
export type BlogTag = z.infer<typeof blogTagSchema>;
export type NewBlogTag = Omit<BlogTag, 'id'>;
export type SelectBlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = typeof blogTags.$inferInsert;