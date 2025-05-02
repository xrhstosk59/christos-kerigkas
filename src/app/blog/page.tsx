// /src/app/blog/page.tsx
import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Τύπος για τα props της σελίδας
interface BlogPageProps {
  searchParams?: {
    category?: string;
    search?: string;
    page?: string;
  };
}

// Δυναμική εισαγωγή του BlogComponent για αποφυγή προβλημάτων με το 'use client' directive
const BlogComponent = dynamic(() => import('@/components/features/blog'), { 
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

export default function BlogPage({ searchParams }: BlogPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <Suspense fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <BlogComponent theme="light" searchParams={searchParams} />
      </Suspense>
    </main>
  )
}