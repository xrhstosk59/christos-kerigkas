// src/app/blog/[slug]/page.tsx
import BlogPostClient from '@/components/blog-post-client'
import type { BlogPost } from '@/types/blog'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Αρχική φόρτωση δεδομένων στον server
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`)
  const initialData = await response.json() as BlogPost

  return <BlogPostClient initialData={initialData} />
}