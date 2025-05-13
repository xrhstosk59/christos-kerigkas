// src/components/features/blog/blog.server.tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { Post } from '@/types/blog'
import BlogList from './blog-list.client'
import BlogSearch from './blog-search.client'
import BlogCategories from './blog-categories.client'
import BlogPagination from './blog-pagination.client'
import { getBlogPosts } from '@/lib/api/blog'
import { ALL_CATEGORIES } from '@/domains/blog/utils/blog-constants'

// Διορθωμένος τύπος props
interface BlogServerProps {
  searchParams?: {
    category?: string;
    search?: string;
    page?: string;
  };
}

// Σταθερά για το πόσα posts θα εμφανίζονται ανά σελίδα
const POSTS_PER_PAGE = 6

// Κύριο component που θα χρησιμοποιείται στο page.tsx
const BlogServer = async ({ searchParams }: BlogServerProps) => {
  // ΔΙΟΡΘΩΣΗ: Χρήση await στο searchParams
  const params = await Promise.resolve(searchParams || {});
  
  // Προετοιμασία παραμέτρων με τις τιμές από το awaited params
  const currentPage = params.page ? parseInt(params.page) : 1
  const selectedCategory = params.category || 'all'
  const searchQuery = params.search || ''
  
  // Ανάκτηση theme preference από cookies
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')
  const theme = themeCookie?.value === 'dark' ? 'dark' : 'light'
  
  // Λήψη των posts με τις σωστές παραμέτρους
  const allPosts = await getBlogPosts({
    category: selectedCategory !== 'all' ? selectedCategory : null,
    search: searchQuery || null,
    page: 1,
    postsPerPage: 100  // Παίρνουμε αρκετά posts για client-side filtering
  })
  
  // Φιλτράρισμα posts βάσει κατηγορίας (αν δεν έχει γίνει server-side)
  const filteredByCategory = selectedCategory === 'all' 
    ? allPosts 
    : allPosts.filter((post: Post) => post.categories?.includes(selectedCategory))
  
  // Φιλτράρισμα posts βάσει αναζήτησης (αν δεν έχει γίνει server-side)
  const filteredPosts = searchQuery 
    ? filteredByCategory.filter((post: Post) => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByCategory
  
  // Υπολογισμός πλήθους σελίδων
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  
  // Λήψη posts για την τρέχουσα σελίδα
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )
  
  // Κατηγορίες με πλήθος posts
  const categories = ALL_CATEGORIES.map((category: string) => {
    const count = allPosts.filter((post: Post) => post.categories?.includes(category)).length
    return { name: category, count }
  })
  
  // Προσθήκη της κατηγορίας "all" με το συνολικό πλήθος posts
  categories.unshift({ name: 'all', count: allPosts.length })
  
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Thoughts, tutorials, and insights about software development, crypto trading, and technology.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-8 sticky top-24">
            <Suspense fallback={<div className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>}>
              <BlogSearch 
                initialQuery={searchQuery} 
                theme={theme} 
              />
            </Suspense>
            
            <Suspense fallback={<div className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>}>
              <BlogCategories 
                categories={categories} 
                selectedCategory={selectedCategory} 
                theme={theme}
              />
            </Suspense>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <Suspense fallback={<div className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>}>
            <BlogList 
              posts={paginatedPosts} 
              theme={theme}
              currentPage={currentPage}
              totalPages={totalPages}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </Suspense>
          
          {totalPages > 1 && (
            <Suspense fallback={<div className="h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md mt-8"></div>}>
              <BlogPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                theme={theme} 
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogServer