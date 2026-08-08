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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admission_tokens: {
        Row: {
          candidate_name: string | null
          completion_year: string
          created_at: string
          date_of_birth: string | null
          id: string
          index_no: string
          school_id: number
          status: string
          token: string
          used_at: string | null
        }
        Insert: {
          candidate_name?: string | null
          completion_year: string
          created_at?: string
          date_of_birth?: string | null
          id?: string
          index_no: string
          school_id: number
          status?: string
          token: string
          used_at?: string | null
        }
        Update: {
          candidate_name?: string | null
          completion_year?: string
          created_at?: string
          date_of_birth?: string | null
          id?: string
          index_no?: string
          school_id?: number
          status?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admission_tokens_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          form_level: number
          form_master_name: string | null
          id: number
          name: string
          programme: string | null
          school_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_level?: number
          form_master_name?: string | null
          id?: never
          name: string
          programme?: string | null
          school_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_level?: number
          form_master_name?: string | null
          id?: never
          name?: string
          programme?: string | null
          school_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          alt_phone: string | null
          created_at: string
          email: string | null
          full_name: string
          id: number
          is_primary: boolean
          phone: string
          relationship: string
          student_id: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          alt_phone?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: never
          is_primary?: boolean
          phone: string
          relationship?: string
          student_id: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          alt_phone?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: never
          is_primary?: boolean
          phone?: string
          relationship?: string
          student_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      houses: {
        Row: {
          capacity: number | null
          created_at: string
          gender: string
          housemaster_name: string | null
          id: number
          name: string
          school_id: number
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          gender?: string
          housemaster_name?: string | null
          id?: never
          name: string
          school_id: number
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          gender?: string
          housemaster_name?: string | null
          id?: never
          name?: string
          school_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "houses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          checkout_id: string | null
          checkout_url: string | null
          client_reference: string
          completion_year: string
          created_at: string
          customer_phone: string | null
          id: string
          index_no: string
          provider_response: Json | null
          school_id: number
          status: string
          token: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          checkout_id?: string | null
          checkout_url?: string | null
          client_reference: string
          completion_year: string
          created_at?: string
          customer_phone?: string | null
          id?: string
          index_no: string
          provider_response?: Json | null
          school_id: number
          status?: string
          token?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          checkout_id?: string | null
          checkout_url?: string | null
          client_reference?: string
          completion_year?: string
          created_at?: string
          customer_phone?: string | null
          id?: string
          index_no?: string
          provider_response?: Json | null
          school_id?: number
          status?: string
          token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          aggregate: number | null
          candidate_name: string
          completion_year: string
          created_at: string
          date_of_birth: string | null
          enrolment_code: string | null
          gender: string
          id: number
          index_no: string
          jhs_attended: string | null
          phone: string | null
          programme: string
          programme_code: string | null
          residency: string
          school_id: number
          updated_at: string
        }
        Insert: {
          aggregate?: number | null
          candidate_name: string
          completion_year: string
          created_at?: string
          date_of_birth?: string | null
          enrolment_code?: string | null
          gender?: string
          id?: never
          index_no: string
          jhs_attended?: string | null
          phone?: string | null
          programme: string
          programme_code?: string | null
          residency?: string
          school_id: number
          updated_at?: string
        }
        Update: {
          aggregate?: number | null
          candidate_name?: string
          completion_year?: string
          created_at?: string
          date_of_birth?: string | null
          enrolment_code?: string | null
          gender?: string
          id?: never
          index_no?: string
          jhs_attended?: string | null
          phone?: string | null
          programme?: string
          programme_code?: string | null
          residency?: string
          school_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          capital: string
          code: string
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          capital: string
          code: string
          created_at?: string
          id?: never
          name: string
          updated_at?: string
        }
        Update: {
          capital?: string
          code?: string
          created_at?: string
          id?: never
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          admission_letter_path: string | null
          admission_letter_template: string | null
          category: string
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          credentials: string | null
          current_cycle: string | null
          cycle_status: string
          established_year: string | null
          id: number
          motto: string | null
          name: string
          personal_records_form_path: string | null
          postal_address: string | null
          principal_name: string | null
          programme_subjects_path: string | null
          prospectus_path: string | null
          region_id: number
          reopening_date: string | null
          school_type: string
          town: string
          undertaking_form_path: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          admission_letter_path?: string | null
          admission_letter_template?: string | null
          category?: string
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          credentials?: string | null
          current_cycle?: string | null
          cycle_status?: string
          established_year?: string | null
          id?: never
          motto?: string | null
          name: string
          personal_records_form_path?: string | null
          postal_address?: string | null
          principal_name?: string | null
          programme_subjects_path?: string | null
          prospectus_path?: string | null
          region_id: number
          reopening_date?: string | null
          school_type?: string
          town: string
          undertaking_form_path?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          admission_letter_path?: string | null
          admission_letter_template?: string | null
          category?: string
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          credentials?: string | null
          current_cycle?: string | null
          cycle_status?: string
          established_year?: string | null
          id?: never
          motto?: string | null
          name?: string
          personal_records_form_path?: string | null
          postal_address?: string | null
          principal_name?: string | null
          programme_subjects_path?: string | null
          prospectus_path?: string | null
          region_id?: number
          reopening_date?: string | null
          school_type?: string
          town?: string
          undertaking_form_path?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_records: {
        Row: {
          admission_letter_path: string | null
          aggregate: number | null
          completion_year: string
          created_at: string
          date_of_birth: string | null
          denomination: string | null
          district: string | null
          enrolment_code: string | null
          enrolment_form_path: string | null
          father_contact: string | null
          father_name: string | null
          father_occupation: string | null
          gender: string | null
          ghana_card_number: string | null
          guardian_contact: string | null
          guardian_digital_address: string | null
          guardian_email: string | null
          guardian_name: string | null
          id: string
          index_no: string
          interests: string | null
          jhs_attended: string | null
          jhs_type: string | null
          medical_notes: string | null
          mother_contact: string | null
          mother_name: string | null
          mother_occupation: string | null
          nationality: string | null
          nhis_number: string | null
          other_names: string | null
          passport_photo_path: string | null
          permanent_address: string | null
          place_of_birth: string | null
          programme: string | null
          raw_score: number | null
          region: string | null
          religion: string | null
          residency: string | null
          school_id: number
          status: string
          surname: string | null
          town: string | null
          updated_at: string
        }
        Insert: {
          admission_letter_path?: string | null
          aggregate?: number | null
          completion_year: string
          created_at?: string
          date_of_birth?: string | null
          denomination?: string | null
          district?: string | null
          enrolment_code?: string | null
          enrolment_form_path?: string | null
          father_contact?: string | null
          father_name?: string | null
          father_occupation?: string | null
          gender?: string | null
          ghana_card_number?: string | null
          guardian_contact?: string | null
          guardian_digital_address?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          id?: string
          index_no: string
          interests?: string | null
          jhs_attended?: string | null
          jhs_type?: string | null
          medical_notes?: string | null
          mother_contact?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          nationality?: string | null
          nhis_number?: string | null
          other_names?: string | null
          passport_photo_path?: string | null
          permanent_address?: string | null
          place_of_birth?: string | null
          programme?: string | null
          raw_score?: number | null
          region?: string | null
          religion?: string | null
          residency?: string | null
          school_id: number
          status?: string
          surname?: string | null
          town?: string | null
          updated_at?: string
        }
        Update: {
          admission_letter_path?: string | null
          aggregate?: number | null
          completion_year?: string
          created_at?: string
          date_of_birth?: string | null
          denomination?: string | null
          district?: string | null
          enrolment_code?: string | null
          enrolment_form_path?: string | null
          father_contact?: string | null
          father_name?: string | null
          father_occupation?: string | null
          gender?: string | null
          ghana_card_number?: string | null
          guardian_contact?: string | null
          guardian_digital_address?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          id?: string
          index_no?: string
          interests?: string | null
          jhs_attended?: string | null
          jhs_type?: string | null
          medical_notes?: string | null
          mother_contact?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          nationality?: string | null
          nhis_number?: string | null
          other_names?: string | null
          passport_photo_path?: string | null
          permanent_address?: string | null
          place_of_birth?: string | null
          programme?: string | null
          raw_score?: number | null
          region?: string | null
          religion?: string | null
          residency?: string | null
          school_id?: number
          status?: string
          surname?: string | null
          town?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          aggregate: number | null
          alt_phone: string | null
          class_assigned_at: string | null
          class_id: number | null
          completion_year: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          enrolment_code: string | null
          full_name: string
          gender: string
          house_assigned_at: string | null
          house_id: number | null
          id: number
          index_no: string
          jhs_attended: string | null
          phone: string | null
          pin: string | null
          programme: string | null
          residency: string
          school_id: number
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          aggregate?: number | null
          alt_phone?: string | null
          class_assigned_at?: string | null
          class_id?: number | null
          completion_year?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          enrolment_code?: string | null
          full_name: string
          gender?: string
          house_assigned_at?: string | null
          house_id?: number | null
          id?: never
          index_no: string
          jhs_attended?: string | null
          phone?: string | null
          pin?: string | null
          programme?: string | null
          residency?: string
          school_id: number
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          aggregate?: number | null
          alt_phone?: string | null
          class_assigned_at?: string | null
          class_id?: number | null
          completion_year?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          enrolment_code?: string | null
          full_name?: string
          gender?: string
          house_assigned_at?: string | null
          house_id?: number | null
          id?: never
          index_no?: string
          jhs_attended?: string | null
          phone?: string | null
          pin?: string | null
          programme?: string | null
          residency?: string
          school_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_cycle_data: { Args: { p_school_id: number }; Returns: Json }
      generate_admission_token:
        | {
            Args: {
              p_completion_year: string
              p_date_of_birth?: string
              p_index_no: string
              p_school_id: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_completion_year: string
              p_date_of_birth?: string
              p_index_no: string
              p_school_id: number
            }
            Returns: Json
          }
      retrieve_admission_token:
        | {
            Args: { p_date_of_birth: string; p_index_no: string }
            Returns: Json
          }
        | {
            Args: { p_date_of_birth: string; p_index_no: string }
            Returns: Json
          }
      verify_admission_token: {
        Args: { p_index_no: string; p_token: string }
        Returns: Json
      }
      verify_school_login: {
        Args: { p_code: string; p_credentials: string; p_school_id: number }
        Returns: Json
      }
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
