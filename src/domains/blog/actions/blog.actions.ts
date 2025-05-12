'use server';

// src/domains/blog/actions/blog.actions.ts
import { blogService } from '../services/blog.service';
import type { 
  BlogPost, 
  NewBlogPost, 
  BlogSearchParams, 
  PaginatedBlogResult 
} from '../models/blog-post.model';
import type { UserWithRole } from '@/lib/auth/access-control';

/**
 * Server action για την ανάκτηση όλων των blog posts.
 * 
 * @param page Αριθμός σελίδας (ξεκινάει από 1)
 * @param limit Αριθμός αποτελεσμάτων ανά σελίδα
 * @returns Promise με τα αποτελέσματα
 */
export async function getPosts(page = 1, limit = 10): Promise<PaginatedBlogResult> {
  return await blogService.getPosts(page, limit);
}

/**
 * Server action για την αναζήτηση blog posts.
 * 
 * @param params Παράμετροι αναζήτησης
 * @returns Promise με τα αποτελέσματα
 */
export async function searchPosts(params: BlogSearchParams): Promise<PaginatedBlogResult> {
  return await blogService.searchPosts(params);
}

/**
 * Server action για την ανάκτηση ενός συγκεκριμένου blog post.
 * 
 * @param slug Το slug του blog post
 * @returns Promise με το blog post ή null αν δεν βρεθεί
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return await blogService.getPostBySlug(slug);
}

/**
 * Server action για τη δημιουργία νέου blog post.
 * 
 * @param post Τα δεδομένα του νέου post
 * @param user Ο χρήστης που επιχειρεί τη δημιουργία
 * @returns Promise με το νέο blog post
 */
export async function createPost(post: NewBlogPost, user: UserWithRole): Promise<BlogPost> {
  return await blogService.createPost(post, user);
}

/**
 * Server action για την ενημέρωση ενός υπάρχοντος blog post.
 * 
 * @param slug Το slug του blog post προς ενημέρωση
 * @param postData Τα νέα δεδομένα του post
 * @param user Ο χρήστης που επιχειρεί την ενημέρωση
 * @returns Promise με το ενημερωμένο blog post
 */
export async function updatePost(slug: string, postData: Partial<NewBlogPost>, user: UserWithRole): Promise<BlogPost | null> {
  return await blogService.updatePost(slug, postData, user);
}

/**
 * Server action για τη διαγραφή ενός blog post.
 * 
 * @param slug Το slug του blog post προς διαγραφή
 * @param user Ο χρήστης που επιχειρεί τη διαγραφή
 * @returns Promise που ολοκληρώνεται μετά τη διαγραφή
 */
export async function deletePost(slug: string, user: UserWithRole): Promise<void> {
  return await blogService.deletePost(slug, user);
}

/**
 * Server action για την ανάκτηση σχετικών blog posts.
 * 
 * @param slug Το slug του blog post για το οποίο αναζητούμε σχετικά posts
 * @param limit Μέγιστος αριθμός σχετικών posts που θα επιστραφούν
 * @returns Promise με τα σχετικά blog posts
 */
export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  return await blogService.getRelatedPosts(slug, limit);
}

/**
 * Server action για την εκκαθάριση όλου του cache για blog posts.
 */
export async function invalidateAllBlogCache(): Promise<void> {
  return await blogService.invalidateAllBlogCache();
}