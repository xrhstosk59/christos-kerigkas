// src/lib/db/schema/blog.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    index,
    integer,
    primaryKey,
    uuid
  } from 'drizzle-orm/pg-core';
  import { users } from './auth';
  
  // Blog categories table
  export const blogCategories = pgTable('blog_categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  
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
  });
  
  // Blog post to category junction table (many-to-many)
  export const blogPostsToCategories = pgTable('blog_posts_to_categories', {
    postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => blogCategories.id, { onDelete: 'cascade' }),
  }, (table) => {
    return {
      pk: primaryKey(table.postId, table.categoryId),
    }
  });
  
  // Export types
  export type BlogCategory = typeof blogCategories.$inferSelect;
  export type NewBlogCategory = typeof blogCategories.$inferInsert;
  
  export type BlogPost = typeof blogPosts.$inferSelect;
  export type NewBlogPost = typeof blogPosts.$inferInsert;