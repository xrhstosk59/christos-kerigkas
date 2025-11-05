// src/domains/blog/repositories/blog.repository.ts
import { ensureDatabaseConnection } from '@/lib/db/helpers';
import type { Database } from '@/lib/db/database.types';
import type { BlogPost, NewBlogPost, PaginatedResult } from '../models/blog-post.model';

// Type for blog post from database
type DBBlogPost = Database['public']['Tables']['blog_posts']['Row'];

// Helper function to ensure categories
function ensureCategories(post: DBBlogPost): BlogPost {
  return {
    ...post,
    categories: post.categories ?? ['general'],
    category: post.categories?.[0] ?? 'general',
    authorName: post.author_name,
    authorImage: post.author_image,
    author_name: post.author_name,
    author_image: post.author_image,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
    readingTime: post.reading_time || 5,
    reading_time: post.reading_time || 5,
    views: post.views || 0,
    published: true, // Default value
  } as BlogPost;
}

// Helper function to transform a list of posts
function transformPosts(posts: DBBlogPost[]): BlogPost[] {
  return posts.map(post => ensureCategories(post));
}

/**
 * Repository for accessing blog posts data.
 * Contains all CRUD and search operations.
 */
export const blogRepository = {
  /**
   * Retrieve all blog posts with pagination.
   */
  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const supabase = await ensureDatabaseConnection();
    const offset = (page - 1) * limit;

    // Get paginated posts
    const { data: rawPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('Error fetching blog posts:', postsError);
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    const posts = transformPosts(rawPosts || []);

    // Get total count
    const { count, error: countError } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting blog posts:', countError);
    }

    const total = count || 0;

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
   * Retrieve a blog post by slug.
   */
  async findBySlug(slug: string): Promise<BlogPost | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching blog post by slug:', error);
      return undefined;
    }

    return post ? ensureCategories(post) : undefined;
  },

  /**
   * Retrieve blog posts by category.
   */
  async findByCategory(category: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const supabase = await ensureDatabaseConnection();
    const offset = (page - 1) * limit;

    // Get paginated posts with category filter
    const { data: rawPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .contains('categories', [category])
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('Error fetching blog posts by category:', postsError);
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    const posts = transformPosts(rawPosts || []);

    // Get total count with category filter
    const { count, error: countError } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .contains('categories', [category]);

    if (countError) {
      console.error('Error counting blog posts by category:', countError);
    }

    const total = count || 0;

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
   * Search blog posts by query.
   */
  async search(query: string, limit: number = 10): Promise<BlogPost[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    const supabase = await ensureDatabaseConnection();
    const searchTerm = `%${query}%`;

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }

    return transformPosts(posts || []);
  },

  /**
   * Retrieve blog posts by tags.
   */
  async findByTags(tags: string[], page: number = 1, limit: number = 10): Promise<PaginatedResult<BlogPost>> {
    const supabase = await ensureDatabaseConnection();
    const offset = (page - 1) * limit;

    // For Supabase, we'll use overlaps for array matching
    const { data: rawPosts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .overlaps('categories', tags)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('Error fetching blog posts by tags:', postsError);
      return {
        posts: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    const posts = transformPosts(rawPosts || []);

    // Get total count
    const { count, error: countError } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .overlaps('categories', tags);

    if (countError) {
      console.error('Error counting blog posts by tags:', countError);
    }

    const total = count || 0;

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
   * Create new blog post.
   */
  async create(post: NewBlogPost): Promise<BlogPost | undefined> {
    const supabase = await ensureDatabaseConnection();

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        date: post.date,
        image: post.image,
        author_name: post.author_name,
        author_image: post.author_image,
        categories: post.categories,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return undefined;
    }

    return data ? ensureCategories(data) : undefined;
  },

  /**
   * Update an existing blog post.
   */
  async update(slug: string, post: Partial<Omit<NewBlogPost, 'createdAt'>>): Promise<BlogPost | undefined> {
    const supabase = await ensureDatabaseConnection();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (post.title) updateData.title = post.title;
    if (post.description) updateData.description = post.description;
    if (post.content) updateData.content = post.content;
    if (post.date) updateData.date = post.date;
    if (post.image) updateData.image = post.image;
    if (post.author_name) updateData.author_name = post.author_name;
    if (post.author_image) updateData.author_image = post.author_image;
    if (post.categories) updateData.categories = post.categories;

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }

    return data ? ensureCategories(data) : undefined;
  },

  /**
   * Delete a blog post.
   */
  async delete(slug: string): Promise<void> {
    const supabase = await ensureDatabaseConnection();

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Error deleting blog post:', error);
    }
  },

  /**
   * Find related blog posts.
   */
  async findRelated(postSlug: string, limit: number = 3): Promise<BlogPost[]> {
    const supabase = await ensureDatabaseConnection();

    // First find the current post and its categories
    const { data: currentPost, error: currentError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', postSlug)
      .single();

    if (currentError || !currentPost) {
      return [];
    }

    const safeCurrentPost = ensureCategories(currentPost);

    // Find posts with similar categories, excluding the current post
    const { data: relatedPosts, error: relatedError } = await supabase
      .from('blog_posts')
      .select('*')
      .overlaps('categories', safeCurrentPost.categories)
      .neq('slug', postSlug)
      .order('date', { ascending: false })
      .limit(limit);

    if (relatedError) {
      console.error('Error fetching related blog posts:', relatedError);
      return [];
    }

    return transformPosts(relatedPosts || []);
  },

  /**
   * Increment view count for a blog post.
   */
  async incrementViews(slug: string): Promise<BlogPost | undefined> {
    const supabase = await ensureDatabaseConnection();

    // First get the current post
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select('views')
      .eq('slug', slug)
      .single();

    if (!currentPost) {
      return undefined;
    }

    const newViews = (currentPost.views || 0) + 1;

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        views: newViews,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing blog post views:', error);
      return undefined;
    }

    return data ? ensureCategories(data) : undefined;
  },

  /**
   * Retrieve most popular blog posts by views.
   */
  async findMostPopular(limit: number = 5): Promise<BlogPost[]> {
    const supabase = await ensureDatabaseConnection();

    const { data: rawPosts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('views', { ascending: false })
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching most popular blog posts:', error);
      return [];
    }

    return transformPosts(rawPosts || []);
  },

  /**
   * Get statistics for blog posts.
   */
  async getStatistics(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    avgViews: number;
    avgReadingTime: number;
  }> {
    const supabase = await ensureDatabaseConnection();

    // Get total posts
    const { count: totalCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    // Get published posts
    const { count: publishedCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    // Get draft posts
    const { count: draftCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', false);

    // Get all posts to calculate averages
    const { data: allPosts } = await supabase
      .from('blog_posts')
      .select('views, reading_time');

    const totalViews = allPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
    const avgViews = allPosts && allPosts.length > 0 ? Math.round(totalViews / allPosts.length) : 0;
    const avgReadingTime = allPosts && allPosts.length > 0
      ? Math.round(allPosts.reduce((sum, post) => sum + (post.reading_time || 0), 0) / allPosts.length)
      : 0;

    return {
      totalPosts: totalCount || 0,
      publishedPosts: publishedCount || 0,
      draftPosts: draftCount || 0,
      totalViews,
      avgViews,
      avgReadingTime,
    };
  }
};
