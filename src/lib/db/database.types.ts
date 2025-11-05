// src/lib/database.types.ts
export type Database = {
    public: {
      Tables: {
        users: {
          Row: {
            id: string
            email: string
            role: string
            two_factor_secret: string | null
            two_factor_enabled: boolean
            two_factor_backup_codes: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            email: string
            role?: string
            two_factor_secret?: string | null
            two_factor_enabled?: boolean
            two_factor_backup_codes?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            email?: string
            role?: string
            two_factor_secret?: string | null
            two_factor_enabled?: boolean
            two_factor_backup_codes?: string | null
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
          }
          Update: {
            id?: number
            slug?: string
            featured?: boolean
            title?: string
            description?: string
            content?: string
            date?: string
            image?: string
            author_name?: string
            author_image?: string
            categories?: string[]
            views?: number
            reading_time?: number
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
        projects: {
          Row: {
            id: number
            slug: string
            title: string
            description: string
            long_description: string | null
            categories: string[]
            tags: string[]
            technologies: string[]
            image: string
            github: string | null
            live_demo: string | null
            status: string
            featured: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: number
            slug: string
            title: string
            description: string
            long_description?: string | null
            categories: string[]
            tags: string[]
            technologies: string[]
            image: string
            github?: string | null
            live_demo?: string | null
            status?: string
            featured?: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: number
            slug?: string
            title?: string
            description?: string
            long_description?: string | null
            categories?: string[]
            tags?: string[]
            technologies?: string[]
            image?: string
            github?: string | null
            live_demo?: string | null
            status?: string
            featured?: boolean
            created_at?: string
            updated_at?: string
          }
        }
        certifications: {
          Row: {
            id: number
            name: string
            title: string
            description: string | null
            issuer: string
            issue_date: string
            expiry_date: string | null
            credential_id: string | null
            credential_url: string | null
            type: string
            skills: string[]
            filename: string | null
            featured: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: number
            name: string
            title: string
            description?: string | null
            issuer: string
            issue_date: string
            expiry_date?: string | null
            credential_id?: string | null
            credential_url?: string | null
            type: string
            skills: string[]
            filename?: string | null
            featured?: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: number
            name?: string
            title?: string
            description?: string | null
            issuer?: string
            issue_date?: string
            expiry_date?: string | null
            credential_id?: string | null
            credential_url?: string | null
            type?: string
            skills?: string[]
            filename?: string | null
            featured?: boolean
            created_at?: string
            updated_at?: string
          }
        }
        crypto_projects: {
          Row: {
            id: number
            project_id: number
            blockchain: string
            smart_contract_address: string | null
            token_standard: string | null
            consensus_mechanism: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: number
            project_id: number
            blockchain: string
            smart_contract_address?: string | null
            token_standard?: string | null
            consensus_mechanism?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: number
            project_id?: number
            blockchain?: string
            smart_contract_address?: string | null
            token_standard?: string | null
            consensus_mechanism?: string | null
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
            details: Record<string, any> | null
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
            details?: Record<string, any> | null
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
            details?: Record<string, any> | null
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