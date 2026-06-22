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
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: string | null
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: string | null
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: string | null
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          affiliate_user_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          property_id: string | null
          referral_signup_id: string | null
          status: string
          transaction_amount: number
          updated_at: string
        }
        Insert: {
          affiliate_user_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string
          id?: string
          property_id?: string | null
          referral_signup_id?: string | null
          status?: string
          transaction_amount?: number
          updated_at?: string
        }
        Update: {
          affiliate_user_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          property_id?: string | null
          referral_signup_id?: string | null
          status?: string
          transaction_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_signup_id_fkey"
            columns: ["referral_signup_id"]
            isOneToOne: false
            referencedRelation: "referral_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_profiles: {
        Row: {
          available_balance: number
          commission_rate: number
          created_at: string
          id: string
          is_active: boolean
          referral_code: string
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          referral_code: string
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          referral_code?: string
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_withdrawals: {
        Row: {
          account_name: string | null
          account_number: string | null
          admin_note: string | null
          affiliate_user_id: string
          amount: number
          bank_name: string | null
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          admin_note?: string | null
          affiliate_user_id: string
          amount: number
          bank_name?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          admin_note?: string | null
          affiliate_user_id?: string
          amount?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          target_role: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          target_role?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          target_role?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string
          room_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by: string
          room_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string
          room_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          property_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          property_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      id_verifications: {
        Row: {
          document_type: string
          document_url: string
          id: string
          reviewed_at: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          property_id: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          property_id?: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          property_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          application_status: boolean
          browser_notifications: boolean
          commission_earned: boolean
          created_at: string
          id: string
          new_application: boolean
          new_tour_request: boolean
          sound_enabled: boolean
          tour_status: boolean
          updated_at: string
          user_id: string
          withdrawal_status: boolean
        }
        Insert: {
          application_status?: boolean
          browser_notifications?: boolean
          commission_earned?: boolean
          created_at?: string
          id?: string
          new_application?: boolean
          new_tour_request?: boolean
          sound_enabled?: boolean
          tour_status?: boolean
          updated_at?: string
          user_id: string
          withdrawal_status?: boolean
        }
        Update: {
          application_status?: boolean
          browser_notifications?: boolean
          commission_earned?: boolean
          created_at?: string
          id?: string
          new_application?: boolean
          new_tour_request?: boolean
          sound_enabled?: boolean
          tour_status?: boolean
          updated_at?: string
          user_id?: string
          withdrawal_status?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_name: string | null
          avatar_url: string | null
          created_at: string
          display_name_preference: string
          email: string | null
          full_name: string | null
          id: string
          is_approved: boolean
          is_suspended: boolean
          phone: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          agency_name?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name_preference?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean
          is_suspended?: boolean
          phone?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          agency_name?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name_preference?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean
          is_suspended?: boolean
          phone?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          best_suited_for: string[] | null
          car_dependent_area: boolean | null
          city: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          listing_purpose: string
          location: string
          neighborhood_features: string[] | null
          owner_id: string
          price: number
          price_period: string
          property_condition: string
          property_type: Database["public"]["Enums"]["property_type"]
          square_feet: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
          walkable_area: boolean | null
          work_from_home_friendly: boolean | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          best_suited_for?: string[] | null
          car_dependent_area?: boolean | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          listing_purpose?: string
          location: string
          neighborhood_features?: string[] | null
          owner_id: string
          price: number
          price_period?: string
          property_condition?: string
          property_type?: Database["public"]["Enums"]["property_type"]
          square_feet?: number | null
          state: string
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string
          walkable_area?: boolean | null
          work_from_home_friendly?: boolean | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          best_suited_for?: string[] | null
          car_dependent_area?: boolean | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          listing_purpose?: string
          location?: string
          neighborhood_features?: string[] | null
          owner_id?: string
          price?: number
          price_period?: string
          property_condition?: string
          property_type?: Database["public"]["Enums"]["property_type"]
          square_feet?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
          walkable_area?: boolean | null
          work_from_home_friendly?: boolean | null
        }
        Relationships: []
      }
      referral_signups: {
        Row: {
          affiliate_user_id: string
          created_at: string
          id: string
          referral_code_used: string
          referred_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_user_id: string
          created_at?: string
          id?: string
          referral_code_used: string
          referred_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_user_id?: string
          created_at?: string
          id?: string
          referral_code_used?: string
          referred_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rental_applications: {
        Row: {
          applicant_id: string
          created_at: string
          email: string
          employment_status: string
          full_name: string
          id: string
          landlord_id: string
          message: string | null
          monthly_income: string | null
          move_in_date: string
          phone: string
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          email: string
          employment_status: string
          full_name: string
          id?: string
          landlord_id: string
          message?: string | null
          monthly_income?: string | null
          move_in_date: string
          phone: string
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          email?: string
          employment_status?: string
          full_name?: string
          id?: string
          landlord_id?: string
          message?: string | null
          monthly_income?: string | null
          move_in_date?: string
          phone?: string
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          actor_id: string | null
          created_at: string
          details: string | null
          event_type: string
          id: string
          new_role: Database["public"]["Enums"]["app_role"] | null
          old_role: Database["public"]["Enums"]["app_role"] | null
          request_id: string | null
          requested_role: Database["public"]["Enums"]["app_role"] | null
          subject_user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: string | null
          event_type: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          request_id?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"] | null
          subject_user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: string | null
          event_type?: string
          id?: string
          new_role?: Database["public"]["Enums"]["app_role"] | null
          old_role?: Database["public"]["Enums"]["app_role"] | null
          request_id?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"] | null
          subject_user_id?: string
        }
        Relationships: []
      }
      role_requests: {
        Row: {
          created_at: string
          id: string
          requested_role: Database["public"]["Enums"]["app_role"]
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          requested_role: Database["public"]["Enums"]["app_role"]
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles: {
        Row: {
          about_me: string | null
          cleanliness_level: string | null
          commute_method: string | null
          cooking_frequency: string | null
          created_at: string
          dealbreakers: string | null
          employer_name: string | null
          employment_type: string | null
          exercise_frequency: string | null
          guest_frequency: string | null
          has_pets: boolean | null
          hobbies: string[] | null
          id: string
          ideal_neighborhood: string | null
          income_stability: string | null
          is_complete: boolean | null
          job_title: string | null
          max_commute_minutes: number | null
          max_monthly_rent: number | null
          monthly_income_range: string | null
          must_have_amenities: string[] | null
          noise_tolerance: string | null
          pet_details: string | null
          preferred_locations: string[] | null
          sleep_schedule: string | null
          smoking: boolean | null
          social_lifestyle: string | null
          updated_at: string
          user_id: string
          utilities_budget: number | null
          willing_advance_months: number | null
          work_from_home: string | null
        }
        Insert: {
          about_me?: string | null
          cleanliness_level?: string | null
          commute_method?: string | null
          cooking_frequency?: string | null
          created_at?: string
          dealbreakers?: string | null
          employer_name?: string | null
          employment_type?: string | null
          exercise_frequency?: string | null
          guest_frequency?: string | null
          has_pets?: boolean | null
          hobbies?: string[] | null
          id?: string
          ideal_neighborhood?: string | null
          income_stability?: string | null
          is_complete?: boolean | null
          job_title?: string | null
          max_commute_minutes?: number | null
          max_monthly_rent?: number | null
          monthly_income_range?: string | null
          must_have_amenities?: string[] | null
          noise_tolerance?: string | null
          pet_details?: string | null
          preferred_locations?: string[] | null
          sleep_schedule?: string | null
          smoking?: boolean | null
          social_lifestyle?: string | null
          updated_at?: string
          user_id: string
          utilities_budget?: number | null
          willing_advance_months?: number | null
          work_from_home?: string | null
        }
        Update: {
          about_me?: string | null
          cleanliness_level?: string | null
          commute_method?: string | null
          cooking_frequency?: string | null
          created_at?: string
          dealbreakers?: string | null
          employer_name?: string | null
          employment_type?: string | null
          exercise_frequency?: string | null
          guest_frequency?: string | null
          has_pets?: boolean | null
          hobbies?: string[] | null
          id?: string
          ideal_neighborhood?: string | null
          income_stability?: string | null
          is_complete?: boolean | null
          job_title?: string | null
          max_commute_minutes?: number | null
          max_monthly_rent?: number | null
          monthly_income_range?: string | null
          must_have_amenities?: string[] | null
          noise_tolerance?: string | null
          pet_details?: string | null
          preferred_locations?: string[] | null
          sleep_schedule?: string | null
          smoking?: boolean | null
          social_lifestyle?: string | null
          updated_at?: string
          user_id?: string
          utilities_budget?: number | null
          willing_advance_months?: number | null
          work_from_home?: string | null
        }
        Relationships: []
      }
      tour_requests: {
        Row: {
          created_at: string
          id: string
          landlord_id: string
          message: string | null
          preferred_date: string
          preferred_time: string
          property_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landlord_id: string
          message?: string | null
          preferred_date: string
          preferred_time: string
          property_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landlord_id?: string
          message?: string | null
          preferred_date?: string
          preferred_time?: string
          property_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
    }
    Functions: {
      approve_role_request: {
        Args: { admin_note?: string; request_id: string }
        Returns: undefined
      }
      bulk_update_affiliate_commission: {
        Args: { new_rate: number; target_user_ids?: string[] }
        Returns: number
      }
      can_join_realtime_topic: { Args: { topic: string }; Returns: boolean }
      get_affiliate_by_code: { Args: { code: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_notification_enabled: {
        Args: { _type: string; _user_id: string }
        Returns: boolean
      }
      is_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_username_taken: {
        Args: { check_username: string; current_user_id: string }
        Returns: boolean
      }
      mask_application_field: {
        Args: { app_status: string; field_value: string }
        Returns: string
      }
      reject_role_request: {
        Args: { admin_note?: string; request_id: string }
        Returns: undefined
      }
      search_profiles_by_role: {
        Args: {
          search_term: string
          target_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: {
          email: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          username: string
        }[]
      }
      search_profiles_for_invite: {
        Args: { search_term: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
          username: string
        }[]
      }
    }
    Enums: {
      app_role: "tenant" | "landlord" | "agent" | "admin" | "affiliate"
      property_status: "draft" | "pending" | "active" | "rented" | "inactive"
      property_type:
        | "apartment"
        | "house"
        | "duplex"
        | "studio"
        | "penthouse"
        | "villa"
        | "office"
        | "shop"
        | "flat"
        | "bungalow"
        | "terrace"
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
      app_role: ["tenant", "landlord", "agent", "admin", "affiliate"],
      property_status: ["draft", "pending", "active", "rented", "inactive"],
      property_type: [
        "apartment",
        "house",
        "duplex",
        "studio",
        "penthouse",
        "villa",
        "office",
        "shop",
        "flat",
        "bungalow",
        "terrace",
      ],
    },
  },
} as const
