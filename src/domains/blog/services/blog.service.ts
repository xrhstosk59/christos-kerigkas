// src/domains/blog/services/blog.service.ts
import { blogRepository } from '../repositories/blog.repository';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/utils/logger';
import { blogCacheKeys } from '../utils/blog-cache-keys';
import { Permission, UserWithRole, checkPermission } from '@/lib/auth/access-control';
import type { 
  BlogPost, 
  NewBlogPost, 
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
  
  /**
   * Δημιουργία νέου blog post.
   * 
   * @param post Τα δεδομένα του νέου post
   * @param user Ο χρήστης που επιχειρεί τη δημιουργία
   * @returns Promise με το νέο blog post
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα
   */
  async createPost(post: NewBlogPost, user: UserWithRole): Promise<BlogPost> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.WRITE_BLOG)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για τη δημιουργία blog post');
    }
    
    try {
      // Δημιουργία του post
      const newPost = await blogRepository.create(post);

      if (!newPost) {
        throw new Error('Αποτυχία δημιουργίας blog post');
      }

      // Στοχευμένη εκκαθάριση του cache για τις λίστες posts
      // Αντί να διαγράφουμε όλα τα κλειδιά, διαγράφουμε μόνο αυτά που επηρεάζονται

      // 1. Διαγραφή της πρώτης σελίδας της λίστας όλων των posts, η οποία επηρεάζεται πάντα
      await cache.delete(blogCacheKeys.posts.all(1, 10)); // Συνηθισμένο μέγεθος σελίδας

      // 2. Διαγραφή των caches για τις κατηγορίες που περιέχονται στο νέο post
      for (const category of post.categories) {
        await cache.delete(blogCacheKeys.posts.byCategory(category, 1, 10));
      }

      logger.info(`Δημιουργία νέου blog post με slug: ${newPost.slug}`, null, 'blog-service');

      return newPost;
    } catch (error) {
      logger.error('Σφάλμα κατά τη δημιουργία blog post:', error, 'blog-service');
      throw new Error('Παρουσιάστηκε σφάλμα κατά τη δημιουργία του blog post');
    }
  },
  
  /**
   * Ενημέρωση ενός υπάρχοντος blog post.
   * 
   * @param slug Το slug του blog post προς ενημέρωση
   * @param postData Τα νέα δεδομένα του post
   * @param user Ο χρήστης που επιχειρεί την ενημέρωση
   * @returns Promise με το ενημερωμένο blog post
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα ή αν το post δεν βρεθεί
   */
  async updatePost(slug: string, postData: Partial<NewBlogPost>, user: UserWithRole): Promise<BlogPost | null> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.WRITE_BLOG)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για την ενημέρωση blog post');
    }
    
    try {
      // Έλεγχος αν το post υπάρχει
      const existingPost = await blogRepository.findBySlug(slug);
      if (!existingPost) {
        throw new Error('Το blog post δεν βρέθηκε');
      }
      
      // Ενημέρωση του post
      const updatedPost = await blogRepository.update(slug, {
        ...postData,
        updated_at: new Date().toISOString()
      });
      
      if (!updatedPost) {
        throw new Error('Το blog post δεν βρέθηκε κατά την ενημέρωση');
      }
      
      // Στοχευμένη εκκαθάριση του cache
      
      // 1. Διαγραφή του cache για το συγκεκριμένο post
      await cache.delete(blogCacheKeys.posts.bySlug(slug));
      
      // 2. Αν άλλαξε το slug, διαγραφή και του cache για το νέο slug
      if (postData.slug && postData.slug !== slug) {
        await cache.delete(blogCacheKeys.posts.bySlug(postData.slug));
      }
      
      // 3. Διαγραφή του cache για τις κατηγορίες του παλιού και του νέου post
      const oldCategories = existingPost.categories || [];
      const newCategories = postData.categories || oldCategories;
      
      const uniqueCategories = [...new Set([...oldCategories, ...newCategories])];
      for (const category of uniqueCategories) {
        await cache.delete(blogCacheKeys.posts.byCategory(category, 1, 10));
      }
      
      // 4. Διαγραφή του cache για τη λίστα όλων των posts (μόνο την πρώτη σελίδα)
      await cache.delete(blogCacheKeys.posts.all(1, 10));
      
      // 5. Διαγραφή του cache για τα σχετικά posts
      await cache.delete(blogCacheKeys.posts.related(slug, 3));
      if (postData.slug && postData.slug !== slug) {
        await cache.delete(blogCacheKeys.posts.related(postData.slug, 3));
      }
      
      logger.info(`Ενημέρωση blog post με slug: ${slug} -> ${updatedPost.slug}`, null, 'blog-service');
      
      return updatedPost;
    } catch (error) {
      logger.error(`Σφάλμα κατά την ενημέρωση blog post με slug ${slug}:`, error, 'blog-service');
      throw error;
    }
  },
  
  /**
   * Διαγραφή ενός blog post.
   * 
   * @param slug Το slug του blog post προς διαγραφή
   * @param user Ο χρήστης που επιχειρεί τη διαγραφή
   * @returns Promise που ολοκληρώνεται μετά τη διαγραφή
   * @throws Error αν ο χρήστης δεν έχει τα απαραίτητα δικαιώματα
   */
  async deletePost(slug: string, user: UserWithRole): Promise<void> {
    // Έλεγχος δικαιωμάτων
    if (!checkPermission(user, Permission.DELETE_BLOG)) {
      throw new Error('Δεν έχετε τα απαραίτητα δικαιώματα για τη διαγραφή blog post');
    }
    
    try {
      // Λήψη του post για να ξέρουμε τις κατηγορίες του
      const post = await blogRepository.findBySlug(slug);
      const categories = post?.categories || [];
      
      // Διαγραφή του post
      await blogRepository.delete(slug);
      
      // Στοχευμένη εκκαθάριση του cache
      
      // 1. Διαγραφή του cache για το συγκεκριμένο post
      await cache.delete(blogCacheKeys.posts.bySlug(slug));
      
      // 2. Διαγραφή του cache για τις κατηγορίες του post
      for (const category of categories) {
        await cache.delete(blogCacheKeys.posts.byCategory(category, 1, 10));
      }
      
      // 3. Διαγραφή του cache για τη λίστα όλων των posts (μόνο την πρώτη σελίδα)
      await cache.delete(blogCacheKeys.posts.all(1, 10));
      
      // 4. Διαγραφή του cache για τα σχετικά posts
      await cache.delete(blogCacheKeys.posts.related(slug, 3));
      
      logger.info(`Διαγραφή blog post με slug: ${slug}`, null, 'blog-service');
    } catch (error) {
      logger.error(`Σφάλμα κατά τη διαγραφή blog post με slug ${slug}:`, error, 'blog-service');
      throw new Error('Παρουσιάστηκε σφάλμα κατά τη διαγραφή του blog post');
    }
  },
  
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