'use server';

// src/lib/db/actions.ts
// DISABLED: This file needs to be rewritten for Supabase
// Use repository pattern or direct Supabase queries instead

// Placeholder exports to prevent import errors
export interface PaginationInfo {
  totalPosts: number;
  totalPages: number;
  currentPage: number;
  postsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogResponse {
  posts: any[];
  pagination: PaginationInfo;
}

export async function getBlogPosts(
  page = 1,
  postsPerPage = 10,
  _category?: string
): Promise<BlogResponse> {
  console.warn('getBlogPosts is disabled - use blog repository instead');
  return {
    posts: [],
    pagination: {
      totalPosts: 0,
      totalPages: 0,
      currentPage: page,
      postsPerPage,
      hasNextPage: false,
      hasPrevPage: false
    }
  };
}

export async function getBlogPostBySlug(_slug: string): Promise<any | null> {
  console.warn('getBlogPostBySlug is disabled - use blog repository instead');
  return null;
}

export async function searchBlogPosts(
  _searchTerm: string,
  page = 1,
  postsPerPage = 10
): Promise<BlogResponse> {
  console.warn('searchBlogPosts is disabled - use blog repository instead');
  return {
    posts: [],
    pagination: {
      totalPosts: 0,
      totalPages: 0,
      currentPage: page,
      postsPerPage,
      hasNextPage: false,
      hasPrevPage: false
    }
  };
}

export async function createBlogPost(_postData: any, _categoryIds: number[]): Promise<any> {
  throw new Error('createBlogPost is disabled - use blog repository instead');
}

export async function updateBlogPost(_id: number, _postData: any, _categoryIds?: number[]): Promise<any> {
  throw new Error('updateBlogPost is disabled - use blog repository instead');
}

export async function deleteBlogPost(_id: number): Promise<{ success: boolean }> {
  throw new Error('deleteBlogPost is disabled - use blog repository instead');
}
