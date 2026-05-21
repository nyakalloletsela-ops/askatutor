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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          featured_until: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_featured: boolean
          phone: string | null
          subjects: string[] | null
          updated_at: string
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          featured_until?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_featured?: boolean
          phone?: string | null
          subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          featured_until?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_featured?: boolean
          phone?: string | null
          subjects?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          duration_min: number
          id: string
          room_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string
          subject: string | null
          tutor_id: string
        }
        Insert: {
          created_at?: string
          duration_min?: number
          id?: string
          room_id?: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id: string
          subject?: string | null
          tutor_id: string
        }
        Update: {
          created_at?: string
          duration_min?: number
          id?: string
          room_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: string
          subject?: string | null
          tutor_id?: string
        }
        Relationships: []
      }
      tutor_subscriptions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["pay_method"]
          status: Database["public"]["Enums"]["sub_status"]
          submitted_at: string
          transaction_ref: string
          tutor_id: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          notes?: string | null
          payment_method: Database["public"]["Enums"]["pay_method"]
          status?: Database["public"]["Enums"]["sub_status"]
          submitted_at?: string
          transaction_ref: string
          tutor_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["pay_method"]
          status?: Database["public"]["Enums"]["sub_status"]
          submitted_at?: string
          transaction_ref?: string
          tutor_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_tutor_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          is_featured: boolean | null
          subjects: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_featured?: boolean | null
          subjects?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_featured?: boolean | null
          subjects?: string[] | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "tutor" | "student"
      pay_method: "mpesa" | "ecocash"
      session_status: "scheduled" | "live" | "completed" | "cancelled"
      sub_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "tutor", "student"],
      pay_method: ["mpesa", "ecocash"],
      session_status: ["scheduled", "live", "completed", "cancelled"],
      sub_status: ["pending", "approved", "rejected"],
    },
  },
} as const
