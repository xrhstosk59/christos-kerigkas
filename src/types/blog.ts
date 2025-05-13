// src/types/blog.ts

export interface Post {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string | Date;
  image: string;
  authorId?: string | number;
  authorName: string;
  authorImage?: string;
  categories?: string[];
  featured?: boolean;
  views?: number;
  readingTime?: number;
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogResponse {
  posts: Post[];
  categories: string[];
  totalPosts: number;
  pagination: BlogPagination | null;
}

export interface BlogQueryParams {
  category: string | null;
  search: string | null;
  page: number;
  postsPerPage: number;
}

export interface BlogSearchParams {
  page: number;
  limit: number;
  sortBy: "title" | "date";
  sortOrder: "desc" | "asc";
  category: string | null;
  query: string | null;
}

export interface BlogPost {
  id?: number | string;
  title: string;
  slug: string;
  description: string;
  content: string;
  date: string | Date;
  image: string;
  author?: {
    name: string;
    image?: string | null;
  } | null;
  categories?: string[] | null;
  featured?: boolean | null;
}

/**
 * Μετατρέπει ένα αντικείμενο BlogPost σε τύπο Post
 */
export function blogPostToPost(blogPost: BlogPost): Post {
  return {
    id: blogPost.id || blogPost.slug,
    slug: blogPost.slug,
    title: blogPost.title,
    description: blogPost.description,
    content: blogPost.content,
    date: blogPost.date,
    image: blogPost.image,
    authorName: blogPost.author?.name || '',
    authorImage: blogPost.author?.image || '',
    categories: blogPost.categories || [],
    featured: blogPost.featured || false
  };
}

/**
 * Μετατρέπει έναν πίνακα αντικειμένων BlogPost σε πίνακα τύπου Post
 */
export function blogPostsToPostArray(blogPosts: BlogPost[]): Post[] {
  return blogPosts.map(blogPostToPost);
}