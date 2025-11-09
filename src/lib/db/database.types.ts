// Auto-generated from Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
          featured: boolean
          views: number
          reading_time: number
          created_at: string
          updated_at: string
          author_id: string | null
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
          featured?: boolean
          views?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
          author_id?: string | null
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
          featured?: boolean
          views?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
          author_id?: string | null
        }
      }
      blog_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts_to_categories: {
        Row: {
          post_id: number
          category_id: number
        }
        Insert: {
          post_id: number
          category_id: number
        }
        Update: {
          post_id?: number
          category_id?: number
        }
      }
      contact_messages: {
        Row: {
          id: number
          name: string
          email: string
          subject: string | null
          message: string
          created_at: string
          read: boolean
          replied: boolean
          status: string
          responded_at: string | null
          responded_by_id: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: number
          name: string
          email: string
          subject?: string | null
          message: string
          created_at?: string
          read?: boolean
          replied?: boolean
          status?: string
          responded_at?: string | null
          responded_by_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: number
          name?: string
          email?: string
          subject?: string | null
          message?: string
          created_at?: string
          read?: boolean
          replied?: boolean
          status?: string
          responded_at?: string | null
          responded_by_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      newsletter_subscribers: {
        Row: {
          id: number
          email: string
          subscribed_at: string
          is_active: boolean
          verification_token: string | null
          verified: boolean
          unsubscribed_at: string | null
          ip_address: string | null
        }
        Insert: {
          id?: number
          email: string
          subscribed_at?: string
          is_active?: boolean
          verification_token?: string | null
          verified?: boolean
          unsubscribed_at?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: number
          email?: string
          subscribed_at?: string
          is_active?: boolean
          verification_token?: string | null
          verified?: boolean
          unsubscribed_at?: string | null
          ip_address?: string | null
        }
      }
      certifications: {
        Row: {
          id: string
          title: string
          issuer: string
          issue_date: string
          expiry_date: string | null
          credential_id: string | null
          credential_url: string | null
          description: string | null
          type: string
          skills: string[]
          filename: string | null
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          issuer: string
          issue_date: string
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          description?: string | null
          type: string
          skills?: string[]
          filename?: string | null
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          issuer?: string
          issue_date?: string
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          description?: string | null
          type?: string
          skills?: string[]
          filename?: string | null
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      certifications_to_skills: {
        Row: {
          certification_id: string
          skill_id: number
        }
        Insert: {
          certification_id: string
          skill_id: number
        }
        Update: {
          certification_id?: string
          skill_id?: number
        }
      }
      projects: {
        Row: {
          id: number
          title: string
          slug: string
          description: string
          tech: string[]
          image: string
          github: string | null
          live_url: string | null
          featured: boolean
          status: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug: string
          description: string
          tech: string[]
          image: string
          github?: string | null
          live_url?: string | null
          featured?: boolean
          status?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          description?: string
          tech?: string[]
          image?: string
          github?: string | null
          live_url?: string | null
          featured?: boolean
          status?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      project_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects_to_categories: {
        Row: {
          project_id: number
          category_id: number
        }
        Insert: {
          project_id: number
          category_id: number
        }
        Update: {
          project_id?: number
          category_id?: number
        }
      }
      crypto_projects: {
        Row: {
          id: number
          title: string
          slug: string
          description: string
          tech: string[]
          icon: string
          status: string
          github_url: string | null
          live_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          slug: string
          description: string
          tech: string[]
          icon: string
          status: string
          github_url?: string | null
          live_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          slug?: string
          description?: string
          tech?: string[]
          icon?: string
          status?: string
          github_url?: string | null
          live_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: number
          name: string
          category: string | null
          proficiency_level: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          category?: string | null
          proficiency_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string | null
          proficiency_level?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: number
          user_id: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: number
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          status: string
          severity: string
          source: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          status: string
          severity: string
          source: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          status?: string
          severity?: string
          source?: string
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: number
          identifier: string
          action_type: string
          attempt_count: number
          first_attempt_at: string
          last_attempt_at: string
          locked_until: string | null
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          identifier: string
          action_type: string
          attempt_count?: number
          first_attempt_at?: string
          last_attempt_at?: string
          locked_until?: string | null
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          identifier?: string
          action_type?: string
          attempt_count?: number
          first_attempt_at?: string
          last_attempt_at?: string
          locked_until?: string | null
          is_locked?: boolean
          created_at?: string
          updated_at?: string
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
