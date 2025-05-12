// src/app/blog/[slug]/page.tsx
import BlogPostView from '@/components/client/blog/blog-post-view'
import type { BlogPost } from '@/types/blog'
import { getBlogPostBySlug } from '@/lib/api/blog'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  try {
    // First try fetching from API
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    let postData: BlogPost | null = null;
    
    if (NEXT_PUBLIC_API_URL) {
      const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/blog/${slug}`);
      if (response.ok) {
        postData = await response.json() as BlogPost;
      }
    }
    
    // Fallback to file-based data if API fails or isn't configured
    if (!postData) {
      postData = await getBlogPostBySlug(slug);
    }
    
    // If still no data, use fallback content
    if (!postData) {
      postData = {
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
    
    // Χρησιμοποιούμε το νέο BlogPostView component με το prop 'post'
    return <BlogPostView post={postData} />;
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
    
    // Χρησιμοποιούμε το νέο BlogPostView component με το prop 'post'
    return <BlogPostView post={fallbackData} />;
  }
}