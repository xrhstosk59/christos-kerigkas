// src/components/features/blog/blog.server.tsx
import { Suspense } from 'react'
import { getBlogPosts } from '@/lib/api/blog'
import { BlogListClient } from './blog-list.client'
import { BlogCategoriesClient } from './blog-categories.client'
import { cn } from '@/lib/utils/utils'

// Τύπος των props
interface BlogProps {
  theme: 'light' | 'dark'
  searchParams?: {
    category?: string
    search?: string
    page?: string
  }
}

// Ορίζουμε το πόσα posts θα εμφανίζονται ανά σελίδα
const POSTS_PER_PAGE = 9;

/**
 * Server Component που φορτώνει τα δεδομένα του blog
 * Χρησιμοποιεί απευθείας το server action για ανάκτηση δεδομένων
 */
async function BlogContent({ theme, searchParams }: BlogProps) {
  // Παίρνουμε τις παραμέτρους αναζήτησης από τα props
  const { category, search, page = '1' } = searchParams || {};
  
  // Μετατροπή του page σε αριθμό
  const currentPage = parseInt(page, 10) || 1;
  
  // Φορτώνουμε τα posts από το server μέσω του lib/api/blog.ts
  const { posts, categories, totalPosts } = await getBlogPosts({
    category,
    search,
    page: currentPage,
    postsPerPage: POSTS_PER_PAGE
  });
  
  // Υπολογισμός του συνολικού αριθμού σελίδων
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className={cn(
          "text-3xl font-bold mb-8 text-center",
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Blog
        </h1>
        
        {/* Κατηγορίες - Client Component */}
        <BlogCategoriesClient 
          categories={categories} 
          selectedCategory={category} 
          theme={theme} 
        />
        
        {/* Λίστα Posts - Client Component */}
        <BlogListClient 
          posts={posts} 
          theme={theme}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={search}
          selectedCategory={category}
        />
      </div>
    </div>
  )
}

/**
 * Blog component με Suspense wrapper
 * Εμφανίζει ένα loading spinner κατά τη φόρτωση
 */
export function Blog({ theme, searchParams }: BlogProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <BlogContent theme={theme} searchParams={searchParams} />
    </Suspense>
  )
}

// Default export για συμβατότητα με τον υπάρχοντα κώδικα
export default Blog;