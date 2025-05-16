'use server';

// src/lib/db/actions.ts
import { getDb, getAdminDb, sql, DbConnectionType, transaction } from './database';
import { and, desc, eq, exists, ilike, or } from 'drizzle-orm';
import { blogPosts, blogCategories, blogPostsToCategories, SelectBlogPost, BlogPost } from './schema/blog';
import { mapDbPostToBlogPost } from './utils/mappers';

// Τύποι για την απόκριση του API
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

// Ανάκτηση blog posts με pagination και βελτιστοποιημένα queries
export async function getBlogPosts(
  page = 1, 
  postsPerPage = 10, 
  category?: string
): Promise<BlogResponse> {
  const db = getDb();
  const offset = (page - 1) * postsPerPage;
  
  try {
    // Δημιουργία βασικού query - χρησιμοποιούμε συγκεκριμένους τύπους
    const baseQuery = db
      .select({
        post: blogPosts,
        categories: sql<string[]>`array_agg(distinct ${blogCategories.name})`
      })
      .from(blogPosts)
      .leftJoin(
        blogPostsToCategories, 
        eq(blogPostsToCategories.postId, blogPosts.id)
      )
      .leftJoin(
        blogCategories, 
        eq(blogCategories.id, blogPostsToCategories.categoryId)
      );

    // Εφαρμογή φίλτρου με διαφορετική προσέγγιση (χωρίς τροποποίηση μεταβλητής)
    const postsResults = await (category && category !== 'all'
      ? baseQuery
          .where(
            exists(
              db.select({ value: sql<number>`1` })
                .from(blogPostsToCategories)
                .innerJoin(
                  blogCategories, 
                  eq(blogCategories.id, blogPostsToCategories.categoryId)
                )
                .where(
                  and(
                    eq(blogPostsToCategories.postId, blogPosts.id),
                    eq(blogCategories.slug, category)
                  )
                )
            )
          )
          .groupBy(blogPosts.id)
          .orderBy(desc(blogPosts.date))
          .limit(postsPerPage)
          .offset(offset)
      : baseQuery
          .groupBy(blogPosts.id)
          .orderBy(desc(blogPosts.date))
          .limit(postsPerPage)
          .offset(offset)
    );
    
    // Ανάκτηση συνολικών αποτελεσμάτων για pagination - με διαφορετική δομή query
    const countResult = await (category && category !== 'all' 
      ? db
          .select({ count: sql<number>`count(distinct ${blogPosts.id})` })
          .from(blogPosts)
          .leftJoin(
            blogPostsToCategories, 
            eq(blogPostsToCategories.postId, blogPosts.id)
          )
          .leftJoin(
            blogCategories, 
            eq(blogCategories.id, blogPostsToCategories.categoryId)
          )
          .where(eq(blogCategories.slug, category))
      : db
          .select({ count: sql<number>`count(distinct ${blogPosts.id})` })
          .from(blogPosts)
    );
    
    const totalPosts = countResult[0]?.count || 0;
    const totalPages = Math.ceil(Number(totalPosts) / postsPerPage);
    
    // Μετασχηματισμός των αποτελεσμάτων στην κατάλληλη μορφή
    const transformedPosts = postsResults.map(result => 
      mapDbPostToBlogPost(result.post, result.categories || [])
    );
    
    return {
      posts: transformedPosts,
      pagination: {
        totalPosts: Number(totalPosts),
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
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  
  try {
    // Ανάκτηση του post με τις κατηγορίες του με ένα query
    const result = await db
      .select({
        post: blogPosts,
        categories: sql<string[]>`array_agg(${blogCategories.name})`
      })
      .from(blogPosts)
      .leftJoin(
        blogPostsToCategories, 
        eq(blogPostsToCategories.postId, blogPosts.id)
      )
      .leftJoin(
        blogCategories, 
        eq(blogCategories.id, blogPostsToCategories.categoryId)
      )
      .where(eq(blogPosts.slug, slug))
      .groupBy(blogPosts.id);
    
    if (result.length === 0) {
      return null;
    }
    
    // Μετατροπή του αποτελέσματος στον τύπο BlogPost
    return mapDbPostToBlogPost(result[0].post, result[0].categories || []);
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    throw new Error(`Failed to fetch blog post with slug ${slug}`);
  }
}

// Αναζήτηση blog posts με βελτιστοποιημένα queries
export async function searchBlogPosts(
  searchTerm: string, 
  page = 1, 
  postsPerPage = 10
): Promise<BlogResponse> {
  const db = getDb();
  const offset = (page - 1) * postsPerPage;
  
  try {
    // Δημιουργία συνθήκης αναζήτησης
    const searchCondition = or(
      ilike(blogPosts.title, `%${searchTerm}%`),
      ilike(blogPosts.content, `%${searchTerm}%`),
      ilike(blogPosts.excerpt || '', `%${searchTerm}%`),
      ilike(blogPosts.description, `%${searchTerm}%`)
    );
    
    // Ανάκτηση των posts με τις κατηγορίες τους
    const postsResults = await db
      .select({
        post: blogPosts,
        categories: sql<string[]>`array_agg(distinct ${blogCategories.name})`
      })
      .from(blogPosts)
      .leftJoin(
        blogPostsToCategories, 
        eq(blogPostsToCategories.postId, blogPosts.id)
      )
      .leftJoin(
        blogCategories, 
        eq(blogCategories.id, blogPostsToCategories.categoryId)
      )
      .where(searchCondition)
      .groupBy(blogPosts.id)
      .orderBy(desc(blogPosts.date))
      .limit(postsPerPage)
      .offset(offset);
    
    // Μέτρηση συνολικών αποτελεσμάτων για pagination
    const countResult = await db
      .select({ count: sql<number>`count(distinct ${blogPosts.id})` })
      .from(blogPosts)
      .where(searchCondition);
    
    const totalPosts = countResult[0]?.count || 0;
    const totalPages = Math.ceil(Number(totalPosts) / postsPerPage);
    
    // Μετασχηματισμός των αποτελεσμάτων
    const transformedPosts = postsResults.map(result => 
      mapDbPostToBlogPost(result.post, result.categories || [])
    );
    
    return {
      posts: transformedPosts,
      pagination: {
        totalPosts: Number(totalPosts),
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

// Δημιουργία νέου blog post (απαιτεί δικαιώματα admin) με transaction
export async function createBlogPost(
  postData: Omit<typeof blogPosts.$inferInsert, 'id'>,
  categoryIds: number[]
): Promise<SelectBlogPost> {
  return transaction(async (tx) => {
    try {
      // Εισαγωγή του blog post
      const [newPost] = await tx
        .insert(blogPosts)
        .values(postData)
        .returning();
      
      // Εισαγωγή των συσχετίσεων με κατηγορίες
      if (categoryIds.length > 0) {
        const categoryRelations = categoryIds.map(categoryId => ({
          postId: newPost.id,
          categoryId
        }));
        
        await tx
          .insert(blogPostsToCategories)
          .values(categoryRelations);
      }
      
      return newPost;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw new Error('Failed to create blog post');
    }
  }, DbConnectionType.ADMIN);
}

// Ενημέρωση υπάρχοντος blog post (απαιτεί δικαιώματα admin) με transaction
export async function updateBlogPost(
  id: number,
  postData: Partial<typeof blogPosts.$inferInsert>,
  categoryIds?: number[]
): Promise<SelectBlogPost> {
  return transaction(async (tx) => {
    try {
      // Ενημέρωση του blog post
      const [updatedPost] = await tx
        .update(blogPosts)
        .set({
          ...postData,
          updatedAt: new Date()
        })
        .where(eq(blogPosts.id, id))
        .returning();
      
      // Ενημέρωση των συσχετίσεων με κατηγορίες αν παρέχονται
      if (categoryIds !== undefined) {
        // Διαγραφή των υπαρχόντων συσχετίσεων
        await tx
          .delete(blogPostsToCategories)
          .where(eq(blogPostsToCategories.postId, id));
        
        // Εισαγωγή των νέων συσχετίσεων
        if (categoryIds.length > 0) {
          const categoryRelations = categoryIds.map(categoryId => ({
            postId: id,
            categoryId
          }));
          
          await tx
            .insert(blogPostsToCategories)
            .values(categoryRelations);
        }
      }
      
      return updatedPost;
    } catch (error) {
      console.error(`Error updating blog post with id ${id}:`, error);
      throw new Error(`Failed to update blog post with id ${id}`);
    }
  }, DbConnectionType.ADMIN);
}

// Διαγραφή blog post (απαιτεί δικαιώματα admin)
export async function deleteBlogPost(id: number): Promise<{ success: boolean }> {
  const db = getAdminDb();
  
  try {
    // Οι συσχετίσεις θα διαγραφούν αυτόματα λόγω του CASCADE constraint
    await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id));
      
    return { success: true };
  } catch (error) {
    console.error(`Error deleting blog post with id ${id}:`, error);
    throw new Error(`Failed to delete blog post with id ${id}`);
  }
}