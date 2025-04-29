// src/lib/db/repositories/blog-repository.ts
import { blogPosts, type BlogPost, type NewBlogPost } from '@/lib/db/schema'
import { ensureDatabaseConnection } from '@/lib/db/helpers'
import { desc, eq, like, or, sql, count } from 'drizzle-orm'

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
    
    const posts = await database.select()
      .from(blogPosts)
      .where(sql`${category} = ANY(${blogPosts.categories})`)
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset);
    
    const [result] = await database
      .select({ total: count() })
      .from(blogPosts)
      .where(sql`${category} = ANY(${blogPosts.categories})`);
    
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
    const database = ensureDatabaseConnection();
    return database.select()
      .from(blogPosts)
      .where(
        or(
          like(blogPosts.title, `%${query}%`),
          like(blogPosts.description, `%${query}%`),
          like(blogPosts.content, `%${query}%`)
        )
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit);
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
  }
}