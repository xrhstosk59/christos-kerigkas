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
// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ελέγχουμε για server-side περιβάλλον
const isServer = typeof window === 'undefined'

// Θα χρησιμοποιήσουμε διαφορετικές μεταβλητές για το client-side
const clientSideUrl = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : null
const clientSideKey = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : null

// Create a singleton client depending on environment
const supabase = isServer
  ? (supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
      : null)
  : (clientSideUrl && clientSideKey
      ? createClient(clientSideUrl, clientSideKey, { auth: { persistSession: true } })
      : null)

// Βεβαιωνόμαστε ότι το client υπάρχει
if (!supabase) {
  console.error(
    'Supabase client initialization failed. ' +
    'Please check your environment variables: ' +
    `${isServer ? 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY' 
               : 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'}`
  )
}

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
  if (!supabase) {
    console.error('Supabase client not initialized')
    return []
  }

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
  if (!supabase) {
    console.error('Supabase client not initialized')
    return null
  }

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
  if (!supabase) {
    console.error('Supabase client not initialized')
    return { posts: [], total: 0 }
  }

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