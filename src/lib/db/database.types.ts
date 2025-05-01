// src/lib/database.types.ts
export type Database = {
    public: {
      Tables: {
        users: {
          Row: {
            id: string
            email: string
            role: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            email: string
            role?: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            email?: string
            role?: string
            created_at?: string
            updated_at?: string
          }
        }
        blog_posts: {
          Row: {
            id: number
            slug: string
            title: string
            description: string
            content: string
            date: string
            image: string
            author_name: string
            author_image: string
            categories: string[]
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: number
            slug: string
            title: string
            description: string
            content: string
            date: string
            image: string
            author_name: string
            author_image: string
            categories: string[]
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: number
            slug?: string
            title?: string
            description?: string
            content?: string
            date?: string
            image?: string
            author_name?: string
            author_image?: string
            categories?: string[]
            created_at?: string
            updated_at?: string
          }
        }
        newsletter_subscribers: {
          Row: {
            id: number
            email: string
            subscribed_at: string
            ip_address: string | null
            is_active: boolean
            unsubscribed_at: string | null
          }
          Insert: {
            id?: number
            email: string
            subscribed_at?: string
            ip_address?: string | null
            is_active?: boolean
            unsubscribed_at?: string | null
          }
          Update: {
            id?: number
            email?: string
            subscribed_at?: string
            ip_address?: string | null
            is_active?: boolean
            unsubscribed_at?: string | null
          }
        }
        contact_messages: {
          Row: {
            id: number
            name: string
            email: string
            message: string
            ip_address: string | null
            status: string
            created_at: string
            responded_at: string | null
            responded_by_id: string | null
          }
          Insert: {
            id?: number
            name: string
            email: string
            message: string
            ip_address?: string | null
            status?: string
            created_at?: string
            responded_at?: string | null
            responded_by_id?: string | null
          }
          Update: {
            id?: number
            name?: string
            email?: string
            message?: string
            ip_address?: string | null
            status?: string
            created_at?: string
            responded_at?: string | null
            responded_by_id?: string | null
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        [_ in never]: never
      }
      Enums: {
        [_ in never]: never
      }
    }
  }