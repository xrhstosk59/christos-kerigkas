// src/lib/utils/blog-utils.ts

/**
 * Calculate reading time for blog content
 * @param content - The blog post content
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  if (!content || content.trim().length === 0) {
    return 1;
  }

  // Remove HTML tags and markdown syntax for accurate word count
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_`~\[\]()]/g, '') // Remove markdown syntax
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Count words
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time (minimum 1 minute)
  const readingTime = Math.ceil(words / wordsPerMinute);
  return Math.max(1, readingTime);
}

/**
 * Generate a slug from a title
 * @param title - The blog post title
 * @returns URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract excerpt from content
 * @param content - The blog post content
 * @param maxLength - Maximum excerpt length (default: 160)
 * @returns Clean excerpt
 */
export function extractExcerpt(content: string, maxLength: number = 160): string {
  if (!content || content.trim().length === 0) {
    return '';
  }

  // Remove HTML tags and markdown syntax
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*_`~\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  // If no sentence end found, cut at last word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Format view count for display
 * @param views - Number of views
 * @returns Formatted view count string
 */
export function formatViewCount(views: number): string {
  if (views < 1000) {
    return views.toString();
  } else if (views < 1000000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
}

/**
 * Get estimated read time display text
 * @param minutes - Reading time in minutes
 * @returns Formatted reading time string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}

/**
 * Check if a blog post is published and visible
 * @param post - Blog post object
 * @returns True if post should be visible to public
 */
export function isPostVisible(post: { published: boolean; status: string; date: Date }): boolean {
  return post.published && 
         post.status === 'published' && 
         new Date(post.date) <= new Date();
}

/**
 * Generate meta description from content if not provided
 * @param content - Blog post content
 * @param existingDescription - Existing meta description
 * @param maxLength - Maximum description length
 * @returns Meta description
 */
export function generateMetaDescription(
  content: string, 
  existingDescription?: string | null, 
  maxLength: number = 160
): string {
  if (existingDescription && existingDescription.trim().length > 0) {
    return existingDescription.trim();
  }

  return extractExcerpt(content, maxLength);
}

/**
 * Validate and clean blog post data
 * @param postData - Raw blog post data
 * @returns Cleaned and validated post data
 */
export function processBlogPostData(postData: {
  title: string;
  content: string;
  description?: string;
  excerpt?: string;
  metaDescription?: string;
  slug?: string;
}): {
  slug: string;
  excerpt: string;
  metaDescription: string;
  readingTime: number;
} {
  const slug = postData.slug || generateSlug(postData.title);
  const excerpt = postData.excerpt || extractExcerpt(postData.content);
  const metaDescription = generateMetaDescription(
    postData.content, 
    postData.metaDescription || postData.description
  );
  const readingTime = calculateReadingTime(postData.content);

  return {
    slug,
    excerpt,
    metaDescription,
    readingTime
  };
}