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
      likes: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          is_match: boolean | null
          location_id: string | null
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          is_match?: boolean | null
          location_id?: string | null
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          is_match?: boolean | null
          location_id?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active_users_count: number | null
          address: string | null
          created_at: string
          id: string
          last_activity: string | null
          latitude: number
          location_id: string
          longitude: number
          name: string
        }
        Insert: {
          active_users_count?: number | null
          address?: string | null
          created_at?: string
          id?: string
          last_activity?: string | null
          latitude: number
          location_id: string
          longitude: number
          name: string
        }
        Update: {
          active_users_count?: number | null
          address?: string | null
          created_at?: string
          id?: string
          last_activity?: string | null
          latitude?: number
          location_id?: string
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          conversation_started: boolean | null
          first_message_by: string | null
          id: string
          last_activity: string | null
          location_id: string | null
          matched_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          conversation_started?: boolean | null
          first_message_by?: string | null
          id?: string
          last_activity?: string | null
          location_id?: string | null
          matched_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          conversation_started?: boolean | null
          first_message_by?: string | null
          id?: string
          last_activity?: string | null
          location_id?: string | null
          matched_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_first_message_by_fkey"
            columns: ["first_message_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_first_message_by_fkey"
            columns: ["first_message_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          match_id: string
          message: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string
          sent_at: string
          type: string
        }
        Insert: {
          id?: string
          match_id: string
          message?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
          sent_at?: string
          type?: string
        }
        Update: {
          id?: string
          match_id?: string
          message?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          sent_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          age: number
          alcohol: string | null
          city: string | null
          created_at: string
          current_check_in: Json | null
          education: string | null
          email: string | null
          fcm_token: string | null
          gender: string
          id: string
          intentions: string[]
          languages: string[] | null
          last_active: string | null
          musical_styles: string[] | null
          name: string
          notifications_enabled: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          photos: string[] | null
          profession: string | null
          religion: string | null
          state: string | null
          updated_at: string
          zodiac_sign: string | null
        }
        Insert: {
          about_me?: string | null
          age: number
          alcohol?: string | null
          city?: string | null
          created_at?: string
          current_check_in?: Json | null
          education?: string | null
          email?: string | null
          fcm_token?: string | null
          gender: string
          id: string
          intentions: string[]
          languages?: string[] | null
          last_active?: string | null
          musical_styles?: string[] | null
          name: string
          notifications_enabled?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          photos?: string[] | null
          profession?: string | null
          religion?: string | null
          state?: string | null
          updated_at?: string
          zodiac_sign?: string | null
        }
        Update: {
          about_me?: string | null
          age?: number
          alcohol?: string | null
          city?: string | null
          created_at?: string
          current_check_in?: Json | null
          education?: string | null
          email?: string | null
          fcm_token?: string | null
          gender?: string
          id?: string
          intentions?: string[]
          languages?: string[] | null
          last_active?: string | null
          musical_styles?: string[] | null
          name?: string
          notifications_enabled?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          photos?: string[] | null
          profession?: string | null
          religion?: string | null
          state?: string | null
          updated_at?: string
          zodiac_sign?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          about_me: string | null
          age: number | null
          alcohol: string | null
          city: string | null
          created_at: string | null
          current_check_in: Json | null
          education: string | null
          gender: string | null
          id: string | null
          intentions: string[] | null
          languages: string[] | null
          last_active: string | null
          musical_styles: string[] | null
          name: string | null
          photos: string[] | null
          profession: string | null
          religion: string | null
          state: string | null
          zodiac_sign: string | null
        }
        Insert: {
          about_me?: string | null
          age?: number | null
          alcohol?: string | null
          city?: string | null
          created_at?: string | null
          current_check_in?: Json | null
          education?: string | null
          gender?: string | null
          id?: string | null
          intentions?: string[] | null
          languages?: string[] | null
          last_active?: string | null
          musical_styles?: string[] | null
          name?: string | null
          photos?: string[] | null
          profession?: string | null
          religion?: string | null
          state?: string | null
          zodiac_sign?: string | null
        }
        Update: {
          about_me?: string | null
          age?: number | null
          alcohol?: string | null
          city?: string | null
          created_at?: string | null
          current_check_in?: Json | null
          education?: string | null
          gender?: string | null
          id?: string | null
          intentions?: string[] | null
          languages?: string[] | null
          last_active?: string | null
          musical_styles?: string[] | null
          name?: string | null
          photos?: string[] | null
          profession?: string | null
          religion?: string | null
          state?: string | null
          zodiac_sign?: string | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
