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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          service_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          service_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_packages: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          features_ar: string[] | null
          features_en: string[] | null
          id: string
          is_popular: boolean | null
          is_recommended: boolean | null
          main_category: string
          price_from: number | null
          price_to: number | null
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          features_ar?: string[] | null
          features_en?: string[] | null
          id?: string
          is_popular?: boolean | null
          is_recommended?: boolean | null
          main_category: string
          price_from?: number | null
          price_to?: number | null
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          features_ar?: string[] | null
          features_en?: string[] | null
          id?: string
          is_popular?: boolean | null
          is_recommended?: boolean | null
          main_category?: string
          price_from?: number | null
          price_to?: number | null
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          alt_ar: string | null
          alt_en: string | null
          created_at: string | null
          id: string
          image_url: string
          project_id: string
          sort_order: number | null
        }
        Insert: {
          alt_ar?: string | null
          alt_en?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          project_id: string
          sort_order?: number | null
        }
        Update: {
          alt_ar?: string | null
          alt_en?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          project_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          completion_date: string | null
          cover_image: string | null
          created_at: string | null
          design_type: string | null
          external_url: string | null
          id: string
          is_featured: boolean | null
          long_desc_ar: string | null
          long_desc_en: string | null
          main_category: string
          role_ar: string | null
          role_en: string | null
          short_desc_ar: string
          short_desc_en: string
          slug: string
          sort_order: number | null
          tags_ar: string[] | null
          tags_en: string[] | null
          technologies_ar: string[] | null
          technologies_en: string[] | null
          title_ar: string
          title_en: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          client_name?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string | null
          design_type?: string | null
          external_url?: string | null
          id?: string
          is_featured?: boolean | null
          long_desc_ar?: string | null
          long_desc_en?: string | null
          main_category: string
          role_ar?: string | null
          role_en?: string | null
          short_desc_ar: string
          short_desc_en: string
          slug: string
          sort_order?: number | null
          tags_ar?: string[] | null
          tags_en?: string[] | null
          technologies_ar?: string[] | null
          technologies_en?: string[] | null
          title_ar: string
          title_en: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          client_name?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string | null
          design_type?: string | null
          external_url?: string | null
          id?: string
          is_featured?: boolean | null
          long_desc_ar?: string | null
          long_desc_en?: string | null
          main_category?: string
          role_ar?: string | null
          role_en?: string | null
          short_desc_ar?: string
          short_desc_en?: string
          slug?: string
          sort_order?: number | null
          tags_ar?: string[] | null
          tags_en?: string[] | null
          technologies_ar?: string[] | null
          technologies_en?: string[] | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          base_price: number | null
          created_at: string | null
          description_ar: string
          description_en: string
          features_ar: string[] | null
          features_en: string[] | null
          icon: string | null
          id: string
          is_featured: boolean | null
          main_category: string
          price_unit_ar: string | null
          price_unit_en: string | null
          slug: string
          sort_order: number | null
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description_ar: string
          description_en: string
          features_ar?: string[] | null
          features_en?: string[] | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          main_category: string
          price_unit_ar?: string | null
          price_unit_en?: string | null
          slug: string
          sort_order?: number | null
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description_ar?: string
          description_en?: string
          features_ar?: string[] | null
          features_en?: string[] | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          main_category?: string
          price_unit_ar?: string | null
          price_unit_en?: string | null
          slug?: string
          sort_order?: number | null
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_long_ar: string | null
          about_long_en: string | null
          about_short_ar: string | null
          about_short_en: string | null
          behance_url: string | null
          cv_url: string | null
          email_contact: string | null
          github_url: string | null
          hero_subtitle_ar: string | null
          hero_subtitle_en: string | null
          hero_title_ar: string | null
          hero_title_en: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          phone_number: string | null
          primary_color: string | null
          secondary_color: string | null
          site_name_ar: string
          site_name_en: string
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          about_long_ar?: string | null
          about_long_en?: string | null
          about_short_ar?: string | null
          about_short_en?: string | null
          behance_url?: string | null
          cv_url?: string | null
          email_contact?: string | null
          github_url?: string | null
          hero_subtitle_ar?: string | null
          hero_subtitle_en?: string | null
          hero_title_ar?: string | null
          hero_title_en?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name_ar?: string
          site_name_en?: string
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          about_long_ar?: string | null
          about_long_en?: string | null
          about_short_ar?: string | null
          about_short_en?: string | null
          behance_url?: string | null
          cv_url?: string | null
          email_contact?: string | null
          github_url?: string | null
          hero_subtitle_ar?: string | null
          hero_subtitle_en?: string | null
          hero_title_ar?: string | null
          hero_title_en?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name_ar?: string
          site_name_en?: string
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
