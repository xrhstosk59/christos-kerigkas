// src/domains/blog/services/blog.service.ts
import { blogRepository } from '../repositories/blog.repository';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/utils/logger';
import { blogCacheKeys } from '../utils/blog-cache-keys';
import type {
  BlogPost,
  BlogSearchParams,
  PaginatedBlogResult
} from '../models/blog-post.model';

/**
 * Service για τη διαχείριση των blog posts.
 * Περιέχει την επιχειρησιακή λογική και χρησιμοποιεί το repository για πρόσβαση στα δεδομένα.
 */
export const blogService = {
  /**
   * Ανάκτηση όλων των blog posts με pagination.
   * 
   * @param page Αριθμός σελίδας (ξεκινάει από 1)
   * @param limit Αριθμός αποτελεσμάτων ανά σελίδα
   * @returns Promise με τα αποτελέσματα
   */
  async getPosts(page: number = 1, limit: number = 10): Promise<PaginatedBlogResult> {
    const cacheKey = blogCacheKeys.posts.all(page, limit);
    
    try {
      // Προσπάθεια ανάκτησης από το cache
      return await cache.getOrSet<PaginatedBlogResult>(
        cacheKey,
        () => blogRepository.findAll(page, limit),
        { expireInSeconds: 60 * 15 } // 15 λεπτά
      );
    } catch (error) {
      logger.error('Σφάλμα κατά την ανάκτηση των blog posts:', error, 'blog-service');
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: page > 1
      };
    }
  },
  
  /**
   * Αναζήτηση blog posts με διάφορα κριτήρια.
   * 
   * @param params Παράμετροι αναζήτησης
   * @returns Promise με τα αποτελέσματα
   */
  async searchPosts(params: BlogSearchParams): Promise<PaginatedBlogResult> {
    const { 
      query = '', 
      category, 
      page = 1, 
      limit = 10,
    } = params;
    
    try {
      if (query) {
        // Αν υπάρχει query, χρησιμοποιούμε την αναζήτηση
        const cacheKey = blogCacheKeys.posts.search(query, limit);
        
        const posts = await cache.getOrSet<BlogPost[]>(
          cacheKey,
          () => blogRepository.search(query, limit),
          { expireInSeconds: 60 * 15 } // 15 λεπτά
        );
        
        return {
          posts,
          total: posts.length,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        };
      } else if (category) {
        // Αν υπάρχει κατηγορία, φιλτράρουμε με βάση αυτή
        const cacheKey = blogCacheKeys.posts.byCategory(category, page, limit);
        
        return await cache.getOrSet<PaginatedBlogResult>(
          cacheKey,
          () => blogRepository.findByCategory(category, page, limit),
          { expireInSeconds: 60 * 15 } // 15 λεπτά
        );
      } else {
        // Διαφορετικά, επιστρέφουμε όλα τα posts
        return await this.getPosts(page, limit);
      }
    } catch (error) {
      logger.error('Σφάλμα κατά την αναζήτηση blog posts:', error, 'blog-service');
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: page > 1
      };
    }
  },
  
  /**
   * Ανάκτηση ενός συγκεκριμένου blog post με βάση το slug.
   * 
   * @param slug Το slug του blog post
   * @returns Promise με το blog post ή null αν δεν βρεθεί
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const cacheKey = blogCacheKeys.posts.bySlug(slug);
    
    try {
      return await cache.getOrSet<BlogPost | null>(
        cacheKey,
        async () => {
          const post = await blogRepository.findBySlug(slug);
          return post || null;
        },
        { expireInSeconds: 60 * 30 } // 30 λεπτά
      );
    } catch (error) {
      logger.error(`Σφάλμα κατά την ανάκτηση του blog post με slug ${slug}:`, error, 'blog-service');
      return null;
    }
  },
  
  // createPost, updatePost, and deletePost methods removed - blog posts managed directly in database or CMS

  /**
   * Εύρεση σχετικών blog posts.
   * 
   * @param slug Το slug του blog post για το οποίο αναζητούμε σχετικά posts
   * @param limit Μέγιστος αριθμός σχετικών posts που θα επιστραφούν
   * @returns Promise με τα σχετικά blog posts
   */
  async getRelatedPosts(slug: string, limit: number = 3): Promise<BlogPost[]> {
    const cacheKey = blogCacheKeys.posts.related(slug, limit);
    
    try {
      return await cache.getOrSet<BlogPost[]>(
        cacheKey,
        () => blogRepository.findRelated(slug, limit),
        { expireInSeconds: 60 * 60 } // 1 ώρα
      );
    } catch (error) {
      logger.error(`Σφάλμα κατά την αναζήτηση σχετικών posts για το slug ${slug}:`, error, 'blog-service');
      return [];
    }
  },
  
  /**
   * Εκκαθάριση όλου του cache για blog posts.
   * Χρήση μόνο σε περιπτώσεις που χρειάζεται πλήρης ανανέωση των δεδομένων.
   */
  async invalidateAllBlogCache(): Promise<void> {
    await cache.invalidatePattern('blogs:*');
    await cache.invalidatePattern('blog:*');
  }
};