// src/app/blog/page.tsx 
import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Τύπος για τα props της σελίδας - Διορθωμένο χωρίς Promise
interface BlogPageProps {
  searchParams?: {
    category?: string;
    search?: string;
    page?: string;
  };
}

// Τα props ακριβώς όπως ορίζονται στο blog.server.tsx
interface BlogProps {
  searchParams?: {
    category?: string;
    search?: string;
    page?: string;
  };
}

// Δυναμική εισαγωγή του Blog component με το σωστό type
const BlogComponent = dynamic<BlogProps>(() => import('@/components/features/blog/blog.server').then(mod => mod.default), {
  ssr: true,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )
})

// Metadata για τη σελίδα του blog
export const metadata: Metadata = {
  title: 'Blog | Christos Kerigkas',
  description: 'Latest articles, tutorials, and insights on web development, crypto, and technology.',
  openGraph: {
    title: 'Blog | Christos Kerigkas',
    description: 'Latest articles, tutorials, and insights on web development, crypto, and technology.',
    url: 'https://christoskerigkas.com/blog',
    siteName: 'Christos Kerigkas',
    images: [
      {
        url: 'https://christoskerigkas.com/api/og?title=Blog',
        width: 1200,
        height: 630,
        alt: 'Blog | Christos Kerigkas',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        {/* Αφαιρούμε το στατικό theme="light" ώστε να λειτουργεί το dark mode */}
        <BlogComponent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}