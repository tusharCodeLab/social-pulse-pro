export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string | null
          description: string
          id: string
          insight_type: string
          is_read: boolean | null
          platform: Database["public"]["Enums"]["social_platform"] | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          is_read?: boolean | null
          platform?: Database["public"]["Enums"]["social_platform"] | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          is_read?: boolean | null
          platform?: Database["public"]["Enums"]["social_platform"] | null
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      audience_metrics: {
        Row: {
          created_at: string | null
          date: string
          engagement_rate: number | null
          followers_count: number | null
          following_count: number | null
          id: string
          lost_followers: number | null
          new_followers: number | null
          platform: Database["public"]["Enums"]["social_platform"]
          social_account_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          lost_followers?: number | null
          new_followers?: number | null
          platform: Database["public"]["Enums"]["social_platform"]
          social_account_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          lost_followers?: number | null
          new_followers?: number | null
          platform?: Database["public"]["Enums"]["social_platform"]
          social_account_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audience_metrics_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      best_posting_times: {
        Row: {
          day_of_week: number
          engagement_score: number | null
          hour_of_day: number
          id: string
          last_calculated_at: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          sample_size: number | null
          user_id: string
        }
        Insert: {
          day_of_week: number
          engagement_score?: number | null
          hour_of_day: number
          id?: string
          last_calculated_at?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          sample_size?: number | null
          user_id: string
        }
        Update: {
          day_of_week?: number
          engagement_score?: number | null
          hour_of_day?: number
          id?: string
          last_calculated_at?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          sample_size?: number | null
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          analyzed_at: string | null
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          sentiment: Database["public"]["Enums"]["sentiment_type"] | null
          sentiment_score: number | null
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          sentiment_score?: number | null
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          sentiment_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          engagement_rate: number | null
          external_post_id: string | null
          id: string
          impressions: number | null
          likes_count: number | null
          media_url: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          post_type: string | null
          published_at: string | null
          reach: number | null
          shares_count: number | null
          social_account_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          external_post_id?: string | null
          id?: string
          impressions?: number | null
          likes_count?: number | null
          media_url?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          post_type?: string | null
          published_at?: string | null
          reach?: number | null
          shares_count?: number | null
          social_account_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          engagement_rate?: number | null
          external_post_id?: string | null
          id?: string
          impressions?: number | null
          likes_count?: number | null
          media_url?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          post_type?: string | null
          published_at?: string | null
          reach?: number | null
          shares_count?: number | null
          social_account_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          account_handle: string | null
          account_name: string
          created_at: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_connected: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_handle?: string | null
          account_name: string
          created_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_connected?: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_handle?: string | null
          account_name?: string
          created_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_connected?: boolean | null
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_image_url?: string | null
          updated_at?: string | null
          user_id?: string
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
      sentiment_type: "positive" | "negative" | "neutral"
      social_platform: "instagram" | "twitter" | "facebook" | "linkedin"
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      sentiment_type: ["positive", "negative", "neutral"],
      social_platform: ["instagram", "twitter", "facebook", "linkedin"],
    },
  },
} as const
