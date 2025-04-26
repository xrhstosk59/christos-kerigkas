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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ελέγχουμε για server-side περιβάλλον
const isServer = typeof window === 'undefined'
const isBuildTime = process.env.NODE_ENV === 'production' && isServer

// Θα χρησιμοποιήσουμε διαφορετικές μεταβλητές για το client-side
const clientSideUrl = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL 
  : null
const clientSideKey = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : null

// Δημιουργούμε το client μόνο όταν είναι απαραίτητο
let supabase: ReturnType<typeof createClient> | null = null

// Αποφεύγουμε τη δημιουργία του client κατά τη διάρκεια του static build
if (!isBuildTime || (process.env.NEXT_PHASE !== 'phase-production-build')) {
  if (isServer) {
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    }
  } else {
    if (clientSideUrl && clientSideKey) {
      supabase = createClient(clientSideUrl, clientSideKey, { auth: { persistSession: true } })
    }
  }
}

// Βεβαιωνόμαστε ότι το client υπάρχει
if (!supabase && !isBuildTime) {
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

// Λειτουργίες για το blog με βελτιωμένο χειρισμό σφαλμάτων
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!supabase) {
    console.warn('Supabase client not initialized during getAllBlogPosts')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
    
    return ((data || []) as BlogPostRow[]).map(mapBlogPostRowToBlogPost)
  } catch (err) {
    console.error('Exception in getAllBlogPosts:', err)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabase) {
    console.warn('Supabase client not initialized during getBlogPostBySlug')
    return null
  }

  try {
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
  } catch (err) {
    console.error('Exception in getBlogPostBySlug:', err)
    return null
  }
}

// Παρόμοια ενημέρωση και για τις άλλες λειτουργίες...

// Export του supabase client για άλλες λειτουργίες
export { supabase }