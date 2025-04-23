// src/lib/db/repositories/blog-repository.ts
import { db } from '@/lib/db'
import { blogPosts, type BlogPost, type NewBlogPost } from '@/lib/db/schema'
import { desc, eq, like, or, sql, count } from 'drizzle-orm'

export const blogRepository = {
  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit
    
    const posts = await db.select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset)
    
    const [result] = await db
      .select({ total: count() })
      .from(blogPosts)
    
    const total = Number(result.total)
    
    return {
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    }
  },
  
  async findBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1)
    
    return post
  },
  
  async findByCategory(category: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit
    
    const posts = await db.select()
      .from(blogPosts)
      .where(sql`${category} = ANY(${blogPosts.categories})`)
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset)
    
    const [result] = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(sql`${category} = ANY(${blogPosts.categories})`)
    
    const total = Number(result.total)
    
    return {
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    }
  },
  
  async search(query: string, limit: number = 10) {
    return db.select()
      .from(blogPosts)
      .where(
        or(
          like(blogPosts.title, `%${query}%`),
          like(blogPosts.description, `%${query}%`),
          like(blogPosts.content, `%${query}%`)
        )
      )
      .orderBy(desc(blogPosts.date))
      .limit(limit)
  },
  
  async create(post: NewBlogPost) {
    const [result] = await db.insert(blogPosts)
      .values(post)
      .returning()
    
    return result
  },
  
  async update(slug: string, post: Partial<Omit<NewBlogPost, 'createdAt'>>) {
    const [result] = await db.update(blogPosts)
      .set({
        ...post,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.slug, slug))
      .returning()
    
    return result
  },
  
  async delete(slug: string) {
    return db.delete(blogPosts)
      .where(eq(blogPosts.slug, slug))
  }
}