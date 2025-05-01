// src/lib/db/repositories/blog-repository.ts
import { blogPosts, type BlogPost, type NewBlogPost } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { desc, eq, like, or, and, not, count, sql } from 'drizzle-orm'

// Τύπος για τα αποτελέσματα αναζήτησης
type PaginatedResult<T> = {
  posts: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const blogRepository = {
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const database = ensureDatabaseConnection();
    const offset = (page - 1) * limit;
    
    const posts = await database.select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
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
  
  async findBySlug(slug: string): Promise<BlogPost | undefined> {
    const database = ensureDatabaseConnection();
    const [post] = await database.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    
    return post;
  },
  
  async findByCategory(category: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const database = ensureDatabaseConnection();
    const offset = (page - 1) * limit;
    
    // Χρήση του sql template ασφαλέστερα
    const posts = await database.select()
      .from(blogPosts)
      .where(
        sql`${category} = ANY(${blogPosts.categories})`
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
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
  
  async search(query: string, limit: number = 10): Promise<BlogPost[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    // Καθαρισμός του query για να αποφευχθεί SQL injection
    const sanitizedQuery = query.trim().replace(/[%_]/g, '\\$&');
    const searchPattern = `%${sanitizedQuery}%`;
    
    const database = ensureDatabaseConnection();
    return database.select()
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
  },
  
  async findByTags(tags: string[], page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const database = ensureDatabaseConnection();
    const offset = (page - 1) * limit;
    
    // Δημιουργία συνθηκών αναζήτησης για κάθε tag
    const whereConditions = tags.map(tag => 
      sql`${tag} = ANY(${blogPosts.categories})`
    );
    
    const posts = await database.select()
      .from(blogPosts)
      .where(or(...whereConditions))
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
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
  
  async create(post: NewBlogPost): Promise<BlogPost> {
    const database = ensureDatabaseConnection();
    const [result] = await database.insert(blogPosts)
      .values(post)
      .returning();
    
    return result;
  },
  
  async update(slug: string, post: Partial<Omit<NewBlogPost, 'createdAt'>>): Promise<BlogPost | undefined> {
    const database = ensureDatabaseConnection();
    const [result] = await database.update(blogPosts)
      .set({
        ...post,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.slug, slug))
      .returning();
    
    return result;
  },
  
  async delete(slug: string): Promise<void> {
    const database = ensureDatabaseConnection();
    await database.delete(blogPosts)
      .where(eq(blogPosts.slug, slug));
  },
  
  // Νέα μέθοδος για εύρεση σχετικών posts
  async findRelated(postSlug: string, limit: number = 3): Promise<BlogPost[]> {
    const database = ensureDatabaseConnection();
    
    // Πρώτα βρίσκουμε το post και τις κατηγορίες του
    const [currentPost] = await database.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, postSlug))
      .limit(1);
    
    if (!currentPost) {
      return [];
    }
    
    // Βρίσκουμε posts με παρόμοιες κατηγορίες, εξαιρώντας το τρέχον post
    const relatedConditions = currentPost.categories.map((category: string) => 
      sql`${category} = ANY(${blogPosts.categories})`
    );
    
    return database.select()
      .from(blogPosts)
      .where(
        and(
          or(...relatedConditions),
          not(eq(blogPosts.slug, postSlug))
        )
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit);
  }
}