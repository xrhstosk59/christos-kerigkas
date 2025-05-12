// src/domains/blog/models/blog-post.model.ts

// Εισαγωγή των τύπων από το schema της βάσης δεδομένων
import type { BlogPost as DbBlogPost, NewBlogPost as DbNewBlogPost } from '@/lib/db/schema/blog';

// Επανεξαγωγή των τύπων με νέα ονόματα
export type BlogPost = DbBlogPost;
export type NewBlogPost = DbNewBlogPost;

/**
 * Παράμετροι αναζήτησης για blog posts.
 */
export interface BlogSearchParams {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Αποτέλεσμα με pagination για blog posts.
 */
export interface PaginatedBlogResult {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Γενικός τύπος για τα αποτελέσματα αναζήτησης με pagination
 */
export type PaginatedResult<T> = {
  posts: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}