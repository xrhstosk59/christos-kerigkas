'use server';

import { getDbClient, getAdminDbClient, sql } from './server-db';
import { eq, and, desc, or, like } from 'drizzle-orm';
import { blogPosts } from './schema/blog';
import { BlogPost } from '@/types/blog';

// Μορφή απόκρισης που αναμένει το υπάρχον useBlog hook
export interface PaginationInfo {
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  postsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogResponse {
  posts: BlogPost[];
  pagination: PaginationInfo;
}

// Διεπαφή για το αποτέλεσμα μέτρησης
interface CountResult {
  count: string | number;
}

// Ανάκτηση blog posts με pagination
export async function getBlogPosts(page = 1, postsPerPage = 10, category?: string): Promise<BlogResponse> {
  const db = getDbClient();
  const offset = (page - 1) * postsPerPage;
  
  try {
    // Δημιουργία συνθηκών αναζήτησης
    const conditions = [];
    
    // Προσθήκη φίλτρου κατηγορίας αν δεν είναι 'all'
    if (category && category !== 'all') {
      conditions.push(eq(blogPosts.category, category));
    }
    
    // Συνδυασμός συνθηκών
    const whereCondition = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    // Εκτέλεση του query με pagination
    const posts = await db.select()
      .from(blogPosts)
      .where(whereCondition)
      .orderBy(desc(blogPosts.createdAt))
      .limit(postsPerPage)
      .offset(offset);
    
    // Μέτρηση συνολικών αποτελεσμάτων για pagination
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM blog_posts ${whereCondition ? sql`WHERE ${whereCondition}` : sql``}`
    );
    
    // Χρήση του as unknown για να μετατρέψουμε σωστά τους τύπους
    const countValue = (countResult[0] as unknown as CountResult)?.count;
    const totalPosts = Number(countValue || 0);
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    return {
      posts: posts as unknown as BlogPost[],
      pagination: {
        totalPosts,
        totalPages,
        currentPage: page,
        postsPerPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

// Ανάκτηση ενός blog post με βάση το slug
export async function getBlogPostBySlug(slug: string) {
  const db = getDbClient();
  
  try {
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    
    return post[0] || null;
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    throw new Error(`Failed to fetch blog post with slug ${slug}`);
  }
}

// Αναζήτηση blog posts
export async function searchBlogPosts(searchTerm: string, page = 1, postsPerPage = 10): Promise<BlogResponse> {
  const db = getDbClient();
  const offset = (page - 1) * postsPerPage;
  
  try {
    // Δημιουργία συνθήκης αναζήτησης με χρήση του LIKE operator
    const searchCondition = or(
      like(blogPosts.title, `%${searchTerm}%`),
      like(blogPosts.content, `%${searchTerm}%`),
      like(blogPosts.excerpt, `%${searchTerm}%`)
    );
    
    // Εκτέλεση του query με pagination
    const posts = await db.select()
      .from(blogPosts)
      .where(searchCondition)
      .orderBy(desc(blogPosts.createdAt))
      .limit(postsPerPage)
      .offset(offset);
    
    // Μέτρηση συνολικών αποτελεσμάτων για pagination
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM blog_posts WHERE 
        title LIKE ${`%${searchTerm}%`} OR 
        content LIKE ${`%${searchTerm}%`} OR 
        excerpt LIKE ${`%${searchTerm}%`}`
    );
    
    // Χρήση του as unknown για να μετατρέψουμε σωστά τους τύπους
    const countValue = (countResult[0] as unknown as CountResult)?.count;
    const totalPosts = Number(countValue || 0);
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    return {
      posts: posts as unknown as BlogPost[],
      pagination: {
        totalPosts,
        totalPages,
        currentPage: page,
        postsPerPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error(`Error searching blog posts for term "${searchTerm}":`, error);
    throw new Error('Failed to search blog posts');
  }
}

// Δημιουργία νέου blog post (απαιτεί δικαιώματα admin)
export async function createBlogPost(postData: typeof blogPosts.$inferInsert) {
  const db = getAdminDbClient();
  
  try {
    const result = await db.insert(blogPosts).values(postData).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw new Error('Failed to create blog post');
  }
}

// Ενημέρωση υπάρχοντος blog post (απαιτεί δικαιώματα admin)
export async function updateBlogPost(id: string, postData: Partial<typeof blogPosts.$inferInsert>) {
  const db = getAdminDbClient();
  
  try {
    // Μετατροπή του id σε αριθμό αν είναι string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const result = await db
      .update(blogPosts)
      .set(postData)
      .where(eq(blogPosts.id, numericId))
      .returning();
      
    return result[0];
  } catch (error) {
    console.error(`Error updating blog post with id ${id}:`, error);
    throw new Error(`Failed to update blog post with id ${id}`);
  }
}

// Διαγραφή blog post (απαιτεί δικαιώματα admin)
export async function deleteBlogPost(id: string) {
  const db = getAdminDbClient();
  
  try {
    // Μετατροπή του id σε αριθμό αν είναι string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, numericId));
      
    return { success: true };
  } catch (error) {
    console.error(`Error deleting blog post with id ${id}:`, error);
    throw new Error(`Failed to delete blog post with id ${id}`);
  }
}

// Εξαγωγή επιπλέον συναρτήσεων αν χρειάζονται
export { sql };