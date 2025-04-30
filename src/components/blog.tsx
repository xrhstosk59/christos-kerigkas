'use client'

// /src/components/blog.tsx
import { useTheme } from '@/components/theme-provider'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Τύπος για τα props του component
interface BlogProps {
  searchParams?: {
    category?: string;
    search?: string;
    page?: string;
  };
}

// Δυναμική εισαγωγή του blog/index.tsx
const BlogComponent = dynamic(() => import('./blog/index'), {
  ssr: true,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

// Το βασικό wrapper component που χρησιμοποιείται στη σελίδα blog
export default function Blog({ searchParams }: BlogProps) {
  // Χρήση του theme από τον ThemeProvider
  const { theme } = useTheme()
  
  return (
    <section className={`py-16 ${theme === 'dark' ? 'bg-gray-950' : 'bg-white'}`}>
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        {/* Πέρασμα του theme και searchParams στο πραγματικό Blog component */}
        <BlogComponent theme={theme} searchParams={searchParams} />
      </Suspense>
    </section>
  )
}