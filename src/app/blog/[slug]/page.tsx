// src/app/blog/[slug]/page.tsx
import BlogPostClient from '@/components/blog-post-client'
import type { BlogPost } from '@/types/blog'
import { getPostBySlug } from '@/lib/blog'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    // First try fetching from API
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    let initialData: BlogPost | null = null;
    
    if (NEXT_PUBLIC_API_URL) {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/blog/${slug}`);
      if (response.ok) {
        initialData = await response.json() as BlogPost;
      }
    }
    
    // Fallback to file-based data if API fails or isn't configured
    if (!initialData) {
      initialData = await getPostBySlug(slug);
    }
    
    // If still no data, use fallback content
    if (!initialData) {
      initialData = {
        slug: slug,
        title: "Post Not Found",
        description: "We couldn't find this blog post.",
        date: new Date().toISOString(),
        image: "/placeholder.jpg",
        author: {
          name: "Christos Kerigkas",
          image: "/profile.jpg"
        },
        categories: ["Uncategorized"],
        content: "# Post Not Available\n\nSorry, this post could not be loaded."
      };
    }
    
    return <BlogPostClient initialData={initialData} />;
  } catch (error) {
    console.error("Error loading blog post:", error);
    
    // Return fallback content in case of error
    const fallbackData = {
      slug: slug,
      title: "Error Loading Post",
      description: "There was an error loading this blog post.",
      date: new Date().toISOString(),
      image: "/placeholder.jpg",
      author: {
        name: "Christos Kerigkas",
        image: "/profile.jpg"
      },
      categories: ["Uncategorized"],
      content: "# Error Loading Post\n\nSorry, there was a problem loading this content."
    };
    
    return <BlogPostClient initialData={fallbackData} />;
  }
}