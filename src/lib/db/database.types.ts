export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      projects: {
        Row: {
          created_at: string | null
          description: string
          featured: boolean | null
          github: string | null
          id: number
          image: string
          live_url: string | null
          order: number | null
          slug: string
          status: string | null
          tech: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          featured?: boolean | null
          github?: string | null
          id?: number
          image: string
          live_url?: string | null
          order?: number | null
          slug: string
          status?: string | null
          tech: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          featured?: boolean | null
          github?: string | null
          id?: number
          image?: string
          live_url?: string | null
          order?: number | null
          slug?: string
          status?: string | null
          tech?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string | null
          credential_id: string | null
          credential_url: string | null
          description: string | null
          expiry_date: string | null
          featured: boolean | null
          filename: string | null
          id: string
          issue_date: string
          issuer: string
          skills: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          description?: string | null
          expiry_date?: string | null
          featured?: boolean | null
          filename?: string | null
          id: string
          issue_date: string
          issuer: string
          skills?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          description?: string | null
          expiry_date?: string | null
          featured?: boolean | null
          filename?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          skills?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: number
          ip_address: string | null
          message: string
          name: string
          read: boolean | null
          replied: boolean | null
          responded_at: string | null
          responded_by_id: string | null
          status: string | null
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          ip_address?: string | null
          message: string
          name: string
          read?: boolean | null
          replied?: boolean | null
          responded_at?: string | null
          responded_by_id?: string | null
          status?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          ip_address?: string | null
          message?: string
          name?: string
          read?: boolean | null
          replied?: boolean | null
          responded_at?: string | null
          responded_by_id?: string | null
          status?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: number
          ip_address: string | null
          is_active: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          verification_token: string | null
          verified: boolean | null
        }
        Insert: {
          email: string
          id?: number
          ip_address?: string | null
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Update: {
          email?: string
          id?: number
          ip_address?: string | null
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_image: string
          author_name: string
          categories: string[]
          content: string
          created_at: string | null
          date: string
          description: string
          featured: boolean | null
          id: number
          image: string
          reading_time: number | null
          slug: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          author_image: string
          author_name: string
          categories: string[]
          content: string
          created_at?: string | null
          date: string
          description: string
          featured?: boolean | null
          id?: number
          image: string
          reading_time?: number | null
          slug: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          author_image?: string
          author_name?: string
          categories?: string[]
          content?: string
          created_at?: string | null
          date?: string
          description?: string
          featured?: boolean | null
          id?: number
          image?: string
          reading_time?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number
          created_at: string
          first_attempt_at: string
          id: number
          identifier: string
          is_locked: boolean
          last_attempt_at: string
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          created_at?: string
          first_attempt_at?: string
          id?: number
          identifier: string
          is_locked?: boolean
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          created_at?: string
          first_attempt_at?: string
          id?: number
          identifier?: string
          is_locked?: boolean
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: number
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          source: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity: string
          source: string
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          source?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crypto_projects: {
        Row: {
          created_at: string | null
          description: string
          github_url: string | null
          icon: string
          id: number
          live_url: string | null
          slug: string
          status: string
          tech: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          github_url?: string | null
          icon: string
          id?: number
          live_url?: string | null
          slug: string
          status: string
          tech: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          github_url?: string | null
          icon?: string
          id?: number
          live_url?: string | null
          slug?: string
          status?: string
          tech?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string | null
          role: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          two_factor_backup_codes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          two_factor_backup_codes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          two_factor_backup_codes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
