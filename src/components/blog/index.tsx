// /src/components/blog/index.tsx
import { Suspense } from 'react'
import { getBlogPosts } from '@/lib/blog'
import BlogList from './blog-list'
import BlogCategories from './blog-categories'
import { cn } from '@/lib/utils'

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

// Server Component που αντικαθιστά την προηγούμενη υλοποίηση
async function BlogContent({ theme, searchParams }: BlogProps) {
  // Παίρνουμε τις παραμέτρους αναζήτησης από τα props
  const { category, search, page = '1' } = searchParams || {};
  
  // Μετατροπή του page σε αριθμό
  const currentPage = parseInt(page, 10) || 1;
  
  // Φορτώνουμε τα posts από το server μέσω του lib/blog.ts
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
        <BlogCategories 
          categories={categories} 
          selectedCategory={category} 
          theme={theme} 
        />
        
        {/* Λίστα Posts - Client Component */}
        <BlogList 
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

// Export το wrapper component που λαμβάνει τα props
export default function Blog({ theme, searchParams }: BlogProps) {
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