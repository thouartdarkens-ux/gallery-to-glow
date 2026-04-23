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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          frequency_days: number | null
          id: string
          is_active: boolean
          last_run_at: string | null
          message_template: string
          name: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          frequency_days?: number | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          message_template: string
          name: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          frequency_days?: number | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          message_template?: string
          name?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          cost: number | null
          created_at: string
          delivered: number | null
          failed: number | null
          id: string
          message_body: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_type: string
          target_value: string | null
          template_id: string | null
          total_recipients: number | null
          type: string
          updated_at: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          delivered?: number | null
          failed?: number | null
          id?: string
          message_body: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_type?: string
          target_value?: string | null
          template_id?: string | null
          total_recipients?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          delivered?: number | null
          failed?: number | null
          id?: string
          message_body?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_type?: string
          target_value?: string | null
          template_id?: string | null
          total_recipients?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          level: string
          name: string
          section: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          id?: string
          level: string
          name: string
          section?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          level?: string
          name?: string
          section?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_groups: {
        Row: {
          created_at: string
          description: string | null
          filter_rules: Json | null
          id: string
          is_dynamic: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filter_rules?: Json | null
          id?: string
          is_dynamic?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filter_rules?: Json | null
          id?: string
          is_dynamic?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
          phone: string
          segment: string | null
          tag: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
          phone: string
          segment?: string | null
          tag?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string
          segment?: string | null
          tag?: string | null
        }
        Relationships: []
      }
      department_subjects: {
        Row: {
          created_at: string
          department_id: string
          id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          subject_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          hod_user_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          hod_user_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          hod_user_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_records: {
        Row: {
          academic_year: string
          amount_paid: number
          balance: number | null
          created_at: string
          id: string
          notes: string | null
          status: string
          student_id: string
          term: string
          total_fee: number
          updated_at: string
        }
        Insert: {
          academic_year?: string
          amount_paid?: number
          balance?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id: string
          term?: string
          total_fee?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount_paid?: number
          balance?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          term?: string
          total_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_at: string
          contact_id: string | null
          group_id: string
          id: string
          student_id: string | null
        }
        Insert: {
          added_at?: string
          contact_id?: string | null
          group_id: string
          id?: string
          student_id?: string | null
        }
        Update: {
          added_at?: string
          contact_id?: string | null
          group_id?: string
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "contact_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          campaign_id: string | null
          cost: number | null
          created_at: string
          delivered_at: string | null
          failed_reason: string | null
          id: string
          recipient_name: string | null
          recipient_phone: string
          sent_at: string | null
          status: string
        }
        Insert: {
          body: string
          campaign_id?: string | null
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          failed_reason?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          body?: string
          campaign_id?: string | null
          cost?: number | null
          created_at?: string
          delivered_at?: string | null
          failed_reason?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          phone_primary: string | null
          phone_secondary: string | null
          phone_secondary_2: string | null
          relationship: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          phone_primary?: string | null
          phone_secondary?: string | null
          phone_secondary_2?: string | null
          relationship?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          phone_primary?: string | null
          phone_secondary?: string | null
          phone_secondary_2?: string | null
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          amount: number
          created_at: string
          fee_record_id: string | null
          id: string
          recorded_by: string | null
          reference: string | null
          sms_sent: boolean
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee_record_id?: string | null
          id?: string
          recorded_by?: string | null
          reference?: string | null
          sms_sent?: boolean
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee_record_id?: string | null
          id?: string
          recorded_by?: string | null
          reference?: string | null
          sms_sent?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_fee_record_id_fkey"
            columns: ["fee_record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          school_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          school_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          school_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          frequency: string
          id: string
          last_run_at: string | null
          message_body: string
          next_run_at: string | null
          scheduled_at: string
          status: string
          target_type: string
          target_value: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          last_run_at?: string | null
          message_body: string
          next_run_at?: string | null
          scheduled_at: string
          status?: string
          target_type?: string
          target_value?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          last_run_at?: string | null
          message_body?: string
          next_run_at?: string | null
          scheduled_at?: string
          status?: string
          target_type?: string
          target_value?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      role_page_access: {
        Row: {
          allowed: boolean
          created_at: string
          id: string
          path: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          allowed?: boolean
          created_at?: string
          id?: string
          path: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          allowed?: boolean
          created_at?: string
          id?: string
          path?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_run_at: string | null
          message_body: string
          next_run_at: string | null
          recurrence: string
          send_at: string
          status: string
          target_filter: Json | null
          target_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_run_at?: string | null
          message_body: string
          next_run_at?: string | null
          recurrence?: string
          send_at: string
          status?: string
          target_filter?: Json | null
          target_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_run_at?: string | null
          message_body?: string
          next_run_at?: string | null
          recurrence?: string
          send_at?: string
          status?: string
          target_filter?: Json | null
          target_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      sms_inbox: {
        Row: {
          body: string
          id: string
          is_read: boolean
          received_at: string
          replied: boolean
          replied_at: string | null
          reply_body: string | null
          sender_name: string | null
          sender_phone: string
        }
        Insert: {
          body: string
          id?: string
          is_read?: boolean
          received_at?: string
          replied?: boolean
          replied_at?: string | null
          reply_body?: string | null
          sender_name?: string | null
          sender_phone: string
        }
        Update: {
          body?: string
          id?: string
          is_read?: boolean
          received_at?: string
          replied?: boolean
          replied_at?: string | null
          reply_body?: string | null
          sender_name?: string | null
          sender_phone?: string
        }
        Relationships: []
      }
      sms_provider_config: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          provider: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_wallet: {
        Row: {
          balance: number
          currency: string
          id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          currency?: string
          id?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          currency?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_pins: {
        Row: {
          created_at: string
          id: string
          must_change: boolean
          pin_hash: string
          pin_plain: string | null
          set_by: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          must_change?: boolean
          pin_hash: string
          pin_plain?: string | null
          set_by?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          must_change?: boolean
          pin_hash?: string
          pin_plain?: string | null
          set_by?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_pins_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tags: {
        Row: {
          id: string
          student_id: string
          tag: string
        }
        Insert: {
          id?: string
          student_id: string
          tag: string
        }
        Update: {
          id?: string
          student_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tags_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year: string | null
          class_id: string | null
          created_at: string
          current_class_level: string | null
          department_id: string | null
          id: string
          is_free_shs: boolean
          is_scholarship: boolean
          name: string
          program: string | null
          residency: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          class_id?: string | null
          created_at?: string
          current_class_level?: string | null
          department_id?: string | null
          id?: string
          is_free_shs?: boolean
          is_scholarship?: boolean
          name: string
          program?: string | null
          residency?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          class_id?: string | null
          created_at?: string
          current_class_level?: string | null
          department_id?: string | null
          id?: string
          is_free_shs?: boolean
          is_scholarship?: boolean
          name?: string
          program?: string | null
          residency?: string
          status?: string
          student_id?: string
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
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          department_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      teaching_assignments: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string
          id: string
          subject_id: string
          teacher_user_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          class_id: string
          created_at?: string
          id?: string
          subject_id: string
          teacher_user_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string
          id?: string
          subject_id?: string
          teacher_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teaching_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_broadcasts: {
        Row: {
          audio_url: string | null
          completed: number | null
          created_at: string
          failed: number | null
          id: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_type: string
          target_value: string | null
          title: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          completed?: number | null
          created_at?: string
          failed?: number | null
          id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_type?: string
          target_value?: string | null
          title: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          completed?: number | null
          created_at?: string
          failed?: number | null
          id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_type?: string
          target_value?: string | null
          title?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          reference: string | null
          type: string
        }
        Insert: {
          amount: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          reference?: string | null
          type?: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          reference?: string | null
          type?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          body: string
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          direction: string
          id: string
          media_url: string | null
          read_at: string | null
          recipient_name: string | null
          recipient_phone: string
          status: string
          whatsapp_message_id: string | null
        }
        Insert: {
          body: string
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone: string
          status?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          body?: string
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          read_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          status?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      academic_year_code: { Args: { _year: string }; Returns: string }
      generate_student_id: {
        Args: { _academic_year: string; _program: string }
        Returns: string
      }
      generate_unique_pin: { Args: never; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      program_code: { Args: { _program: string }; Returns: string }
      verify_student_pin: {
        Args: { _pin: string; _student_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "school_admin"
        | "accounts"
        | "marketing"
        | "headmaster"
        | "asst_head_academic"
        | "asst_head_admin"
        | "asst_head_domestic"
        | "senior_housemaster"
        | "hod"
        | "subject_teacher"
        | "form_master"
        | "guidance_counselor"
        | "library_officer"
        | "lab_technician"
        | "housemaster"
        | "chaplain"
        | "bursar"
        | "internal_auditor"
        | "school_secretary"
        | "supply_officer"
        | "ict_coordinator"
        | "technical_officer"
        | "domestic_bursar"
        | "chief_cook"
        | "assistant_cook"
        | "pantry_steward"
        | "security_officer"
        | "school_driver"
        | "general_labourer"
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
      app_role: [
        "super_admin",
        "school_admin",
        "accounts",
        "marketing",
        "headmaster",
        "asst_head_academic",
        "asst_head_admin",
        "asst_head_domestic",
        "senior_housemaster",
        "hod",
        "subject_teacher",
        "form_master",
        "guidance_counselor",
        "library_officer",
        "lab_technician",
        "housemaster",
        "chaplain",
        "bursar",
        "internal_auditor",
        "school_secretary",
        "supply_officer",
        "ict_coordinator",
        "technical_officer",
        "domestic_bursar",
        "chief_cook",
        "assistant_cook",
        "pantry_steward",
        "security_officer",
        "school_driver",
        "general_labourer",
      ],
    },
  },
} as const
