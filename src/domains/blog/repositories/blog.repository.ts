// src/domains/blog/repositories/blog.repository.ts
import { blogPosts } from '@/lib/db/schema/blog';
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import { desc, eq, like, or, and, not, count, sql } from 'drizzle-orm';
import type { BlogPost, NewBlogPost, PaginatedResult } from '../models/blog-post.model';

// Τύπος που αντιπροσωπεύει το blog post όπως επιστρέφεται από τη βάση πριν τη μετατροπή
type RawBlogPost = Omit<BlogPost, 'categories' | 'category'> & {
  categories: string[] | null;
  category: string | null;
};

// Βοηθητική συνάρτηση για τη μετατροπή του null σε άδειο array για το πεδίο categories
function ensureCategories(post: RawBlogPost): BlogPost {
  return {
    ...post,
    categories: post.categories ?? ['general'],
    category: post.category ?? 'general'
  };
}

// Βοηθητική συνάρτηση για τη μετατροπή μιας λίστας posts
function transformPosts(posts: RawBlogPost[]): BlogPost[] {
  return posts.map(post => ensureCategories(post));
}

/**
 * Repository για την πρόσβαση στα δεδομένα των blog posts.
 * Περιέχει όλες τις λειτουργίες CRUD και αναζήτησης.
 */
export const blogRepository = {
  /**
   * Ανάκτηση όλων των blog posts με pagination.
   * 
   * @param page Αριθμός σελίδας (ξεκινάει από 1)
   * @param limit Αριθμός αποτελεσμάτων ανά σελίδα
   * @returns Promise με τα αποτελέσματα
   */
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const offset = (page - 1) * limit;
    
    const rawPosts = await database.select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
    // Μετατροπή των δεδομένων από τη βάση στον αναμενόμενο τύπο BlogPost
    const posts = transformPosts(rawPosts as RawBlogPost[]);
    
    const [result] = await database
      .select({ total: count() })
      .from(blogPosts);
    
    const total = Number(result.total);
    
    return {
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  },
  
  /**
   * Ανάκτηση ενός blog post με βάση το slug.
   * 
   * @param slug Το slug του blog post
   * @returns Promise με το blog post ή undefined αν δεν βρεθεί
   */
  async findBySlug(slug: string): Promise<BlogPost | undefined> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const [post] = await database.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    
    return post ? ensureCategories(post as RawBlogPost) : undefined;
  },
  
  /**
   * Ανάκτηση blog posts με βάση την κατηγορία.
   * 
   * @param category Η κατηγορία των blog posts
   * @param page Αριθμός σελίδας
   * @param limit Αριθμός αποτελεσμάτων ανά σελίδα
   * @returns Promise με τα αποτελέσματα
   */
  async findByCategory(category: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const offset = (page - 1) * limit;
    
    // Χρήση του sql template ασφαλέστερα
    const rawPosts = await database.select()
      .from(blogPosts)
      .where(
        sql`${category} = ANY(${blogPosts.categories})`
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
    const posts = transformPosts(rawPosts as RawBlogPost[]);
    
    const [result] = await database
      .select({ total: count() })
      .from(blogPosts)
      .where(
        sql`${category} = ANY(${blogPosts.categories})`
      );
    
    const total = Number(result.total);
    
    return {
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  },
  
  /**
   * Αναζήτηση blog posts με βάση ένα query.
   * 
   * @param query Το query αναζήτησης
   * @param limit Μέγιστος αριθμός αποτελεσμάτων
   * @returns Promise με τα αποτελέσματα
   */
  async search(query: string, limit: number = 10): Promise<BlogPost[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    // Καθαρισμός του query για να αποφευχθεί SQL injection
    const sanitizedQuery = query.trim().replace(/[%_]/g, '\\$&');
    const searchPattern = `%${sanitizedQuery}%`;
    
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const posts = await database.select()
      .from(blogPosts)
      .where(
        or(
          like(blogPosts.title, searchPattern),
          like(blogPosts.description, searchPattern),
          like(blogPosts.content, searchPattern)
        )
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit);
    
    return transformPosts(posts as RawBlogPost[]);
  },
  
  /**
   * Ανάκτηση blog posts με βάση τα tags.
   * 
   * @param tags Λίστα με tags
   * @param page Αριθμός σελίδας
   * @param limit Αριθμός αποτελεσμάτων ανά σελίδα
   * @returns Promise με τα αποτελέσματα
   */
  async findByTags(tags: string[], page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const offset = (page - 1) * limit;
    
    // Δημιουργία συνθηκών αναζήτησης για κάθε tag
    const whereConditions = tags.map(tag => 
      sql`${tag} = ANY(${blogPosts.categories})`
    );
    
    const rawPosts = await database.select()
      .from(blogPosts)
      .where(or(...whereConditions))
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
    const posts = transformPosts(rawPosts as RawBlogPost[]);
    
    const [result] = await database
      .select({ total: count() })
      .from(blogPosts)
      .where(or(...whereConditions));
    
    const total = Number(result.total);
    
    return {
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  },
  
  /**
   * Δημιουργία νέου blog post.
   * 
   * @param post Τα δεδομένα του νέου post
   * @returns Promise με το νέο blog post
   */
  async create(post: NewBlogPost): Promise<BlogPost> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const [result] = await database.insert(blogPosts)
      .values(post)
      .returning();
    
    return ensureCategories(result as RawBlogPost);
  },
  
  /**
   * Ενημέρωση ενός υπάρχοντος blog post.
   * 
   * @param slug Το slug του blog post
   * @param post Τα νέα δεδομένα του post
   * @returns Promise με το ενημερωμένο blog post
   */
  async update(slug: string, post: Partial<Omit<NewBlogPost, 'createdAt'>>): Promise<BlogPost | undefined> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    const [result] = await database.update(blogPosts)
      .set({
        ...post,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.slug, slug))
      .returning();
    
    return result ? ensureCategories(result as RawBlogPost) : undefined;
  },
  
  /**
   * Διαγραφή ενός blog post.
   * 
   * @param slug Το slug του blog post
   * @returns Promise που ολοκληρώνεται μετά τη διαγραφή
   */
  async delete(slug: string): Promise<void> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    await database.delete(blogPosts)
      .where(eq(blogPosts.slug, slug));
  },
  
  /**
   * Εύρεση σχετικών blog posts.
   * 
   * @param postSlug Το slug του blog post
   * @param limit Μέγιστος αριθμός αποτελεσμάτων
   * @returns Promise με τα σχετικά blog posts
   */
  async findRelated(postSlug: string, limit: number = 3): Promise<BlogPost[]> {
    const database = await ensureDatabaseConnection(); // Προσθέτουμε await
    
    // Πρώτα βρίσκουμε το post και τις κατηγορίες του
    const [currentPost] = await database.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, postSlug))
      .limit(1);
    
    if (!currentPost) {
      return [];
    }
    
    // Βεβαιωνόμαστε ότι έχουμε έγκυρες κατηγορίες
    const safeCurrentPost = ensureCategories(currentPost as RawBlogPost);
    
    // Βρίσκουμε posts με παρόμοιες κατηγορίες, εξαιρώντας το τρέχον post
    const relatedConditions = safeCurrentPost.categories.map((category: string) => 
      sql`${category} = ANY(${blogPosts.categories})`
    );
    
    const relatedPosts = await database.select()
      .from(blogPosts)
      .where(
        and(
          or(...relatedConditions),
          not(eq(blogPosts.slug, postSlug))
        )
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit);
    
    return transformPosts(relatedPosts as RawBlogPost[]);
  }
}