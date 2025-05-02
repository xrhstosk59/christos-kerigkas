// /src/types/blog.ts

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
  pagination?: BlogPagination;
}

export interface BlogQueryParams {
  category?: string;
  search?: string;
  page?: number;
  postsPerPage?: number;
}

// Προσθήκη του τύπου BlogPost που λείπει
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
    image?: string;
  };
  categories?: string[];
  featured?: boolean;
}