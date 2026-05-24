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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          parent_id: string | null
          subject: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      help_messages: {
        Row: {
          body: string
          created_at: string
          email: string
          id: string
          name: string
          status: Database["public"]["Enums"]["help_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          email: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["help_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["help_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          featured_until: string | null
          free_minutes_remaining: number
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
          free_minutes_remaining?: number
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
          free_minutes_remaining?: number
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
          is_free: boolean
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
          is_free?: boolean
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
          is_free?: boolean
          room_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: string
          subject?: string | null
          tutor_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          label: string
          multiline: boolean
          section: string
          sort_order: number
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          key: string
          label: string
          multiline?: boolean
          section: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          key?: string
          label?: string
          multiline?: boolean
          section?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      student_subscriptions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["pay_method"]
          status: Database["public"]["Enums"]["sub_status"]
          student_id: string
          submitted_at: string
          transaction_ref: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          notes?: string | null
          payment_method: Database["public"]["Enums"]["pay_method"]
          status?: Database["public"]["Enums"]["sub_status"]
          student_id: string
          submitted_at?: string
          transaction_ref: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["pay_method"]
          status?: Database["public"]["Enums"]["sub_status"]
          student_id?: string
          submitted_at?: string
          transaction_ref?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          level: Database["public"]["Enums"]["subject_level"]
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          level: Database["public"]["Enums"]["subject_level"]
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["subject_level"]
          name?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tutor_application_documents: {
        Row: {
          application_id: string
          id: string
          label: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          id?: string
          label: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          id?: string
          label?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "tutor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_applications: {
        Row: {
          admin_notes: string | null
          bio: string
          email: string
          full_name: string
          id: string
          phone: string | null
          qualifications: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["tutor_application_status"]
          subjects: string[]
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bio: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          qualifications: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["tutor_application_status"]
          subjects?: string[]
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bio?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          qualifications?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["tutor_application_status"]
          subjects?: string[]
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tutor_courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          level: Database["public"]["Enums"]["subject_level"]
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["course_status"]
          tutor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          level: Database["public"]["Enums"]["subject_level"]
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          tutor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["subject_level"]
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          tutor_id?: string
        }
        Relationships: []
      }
      tutor_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          session_id: string | null
          student_id: string
          tutor_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          session_id?: string | null
          student_id: string
          tutor_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          session_id?: string | null
          student_id?: string
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
      forum_posts_public: {
        Row: {
          author_name: string | null
          body: string | null
          created_at: string | null
          id: string | null
          parent_id: string | null
          subject: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_tutor_application: {
        Args: { _application_id: string; _notes?: string }
        Returns: undefined
      }
      can_access_classroom_room: { Args: { _room: string }; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_public_tutors: {
        Args: never
        Returns: {
          avatar_url: string
          avg_rating: number
          bio: string
          full_name: string
          hourly_rate: number
          id: string
          is_featured: boolean
          review_count: number
          session_count: number
          subjects: string[]
        }[]
      }
      list_students_for_tutor: {
        Args: never
        Returns: {
          full_name: string
          id: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      reject_tutor_application: {
        Args: { _application_id: string; _notes?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "tutor" | "student"
      course_status: "pending" | "approved" | "rejected"
      help_status: "open" | "answered" | "closed"
      pay_method: "mpesa" | "ecocash"
      session_status: "scheduled" | "live" | "completed" | "cancelled"
      sub_status: "pending" | "approved" | "rejected"
      subject_level: "primary" | "high_school" | "tertiary"
      tutor_application_status:
        | "pending"
        | "approved"
        | "rejected"
        | "needs_info"
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
      course_status: ["pending", "approved", "rejected"],
      help_status: ["open", "answered", "closed"],
      pay_method: ["mpesa", "ecocash"],
      session_status: ["scheduled", "live", "completed", "cancelled"],
      sub_status: ["pending", "approved", "rejected"],
      subject_level: ["primary", "high_school", "tertiary"],
      tutor_application_status: [
        "pending",
        "approved",
        "rejected",
        "needs_info",
      ],
    },
  },
} as const
