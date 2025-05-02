// src/auth/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
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

// Τύπος για τα responses από το Supabase

// Κλάση για διαχείριση των σφαλμάτων του Supabase
export class SupabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'SupabaseError'
  }
}

// Κεντρική διαχείριση για το Supabase client
class SupabaseManager {
  private client: SupabaseClient | null = null
  private isBuildTime: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Ελέγχουμε για server-side περιβάλλον
    const isServer = typeof window === 'undefined'
    this.isBuildTime = process.env.NODE_ENV === 'production' && isServer && 
      (process.env.NEXT_PHASE === 'phase-production-build')

    // Αποφεύγουμε τη δημιουργία του client κατά τη διάρκεια του static build
    if (this.isBuildTime) {
      return
    }

    try {
      if (isServer) {
        // Server-side client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (supabaseUrl && supabaseKey) {
          this.client = createClient(supabaseUrl, supabaseKey, { 
            auth: { persistSession: false } 
          })
        }
      } else {
        // Client-side client
        const clientSideUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const clientSideKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (clientSideUrl && clientSideKey) {
          this.client = createClient(clientSideUrl, clientSideKey, { 
            auth: { persistSession: true } 
          })
        }
      }

      if (!this.client) {
        console.warn(
          'Supabase client initialization failed. ' +
          'Please check your environment variables.'
        )
      }
    } catch (error) {
      console.error('Error initializing Supabase client:', error)
      this.client = null
    }
  }

  // Ασφαλής πρόσβαση στο client
  getClient(): SupabaseClient {
    if (this.isBuildTime) {
      throw new SupabaseError('Supabase client is not available during build time')
    }
    
    if (!this.client) {
      throw new SupabaseError('Supabase client is not initialized')
    }
    
    return this.client
  }

  // Έλεγχος αν το client είναι διαθέσιμο
  isClientAvailable(): boolean {
    return !this.isBuildTime && !!this.client
  }

  // Ασφαλής εκτέλεση ενεργειών με χειρισμό σφαλμάτων
  async execute<T>(
    action: (client: SupabaseClient) => Promise<T>,
    errorMessage = 'Error executing Supabase operation'
  ): Promise<T> {
    try {
      const client = this.getClient()
      return await action(client)
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error
      }
      throw new SupabaseError(errorMessage, error)
    }
  }
}

// Singleton instance
export const supabaseManager = new SupabaseManager()

// Για συμβατότητα με υπάρχοντα κώδικα
export const supabase = supabaseManager.isClientAvailable() 
  ? supabaseManager.getClient() 
  : null

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
  try {
    if (!supabaseManager.isClientAvailable()) {
      console.warn('Supabase client not initialized during getAllBlogPosts')
      return []
    }

    const result = await supabaseManager.getClient()
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
    
    if (result.error) {
      console.error('Error fetching blog posts:', result.error)
      return []
    }
    
    return ((result.data || []) as BlogPostRow[]).map(mapBlogPostRowToBlogPost)
  } catch (err) {
    console.error('Exception in getAllBlogPosts:', err)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    if (!supabaseManager.isClientAvailable()) {
      console.warn('Supabase client not initialized during getBlogPostBySlug')
      return null
    }

    const result = await supabaseManager.getClient()
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (result.error) {
      console.error('Error fetching blog post:', result.error)
      return null
    }
    
    if (!result.data) return null;
    return mapBlogPostRowToBlogPost(result.data as BlogPostRow)
  } catch (err) {
    console.error('Exception in getBlogPostBySlug:', err)
    return null
  }
}