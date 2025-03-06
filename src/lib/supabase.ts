// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { BlogPost } from '@/types/blog'

// Τύποι για το schema του Supabase
export type BlogPostRow = {
  id: number
  slug: string
  title: string
  description: string
  date: string
  image: string
  author_name: string
  author_image: string
  categories: string[]
  content: string
  created_at: string
}

// Δημιουργία του Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

// Create a singleton client for use throughout the app
let supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Μετατροπή από το schema της βάσης στο type της εφαρμογής
export function mapBlogPostRowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    image: row.image,
    author: {
      name: row.author_name,
      image: row.author_image
    },
    categories: row.categories,
    content: row.content
  }
}

// Λειτουργίες για το blog
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
  
  return ((data || []) as BlogPostRow[]).map(mapBlogPostRowToBlogPost)
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
  
  if (!data) return null;
  return mapBlogPostRowToBlogPost(data as BlogPostRow)
}

export async function getBlogPostsByCategory(category: string, page: number = 1, perPage: number = 6): Promise<{
  posts: BlogPost[],
  total: number
}> {
  // Αν δεν έχει οριστεί κατηγορία ή είναι 'all', επιστρέφουμε όλα τα posts
  const query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
  
  if (category && category !== 'all') {
    query.contains('categories', [category])
  }
  
  // Προσθέτουμε pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  
  const { data, count, error } = await query.range(from, to)
  
  if (error) {
    console.error('Error fetching blog posts by category:', error)
    return { posts: [], total: 0 }
  }
  
  return { 
    posts: ((data || []) as BlogPostRow[]).map(mapBlogPostRowToBlogPost),
    total: count || 0
  }
}

// Export του supabase client για άλλες λειτουργίες
export { supabase }