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
      admin_email_whitelist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      app_clients: {
        Row: {
          activated_at: string | null
          country_of_origin: string | null
          created_at: string
          device_info: Json | null
          email: string | null
          full_name: string | null
          has_asset_protection: boolean
          has_pet_rescue: boolean
          id: string
          intake_session_id: string | null
          invite_token: string
          language: string
          phone_e164: string | null
          place_of_birth: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          country_of_origin?: string | null
          created_at?: string
          device_info?: Json | null
          email?: string | null
          full_name?: string | null
          has_asset_protection?: boolean
          has_pet_rescue?: boolean
          id?: string
          intake_session_id?: string | null
          invite_token: string
          language?: string
          phone_e164?: string | null
          place_of_birth?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          country_of_origin?: string | null
          created_at?: string
          device_info?: Json | null
          email?: string | null
          full_name?: string | null
          has_asset_protection?: boolean
          has_pet_rescue?: boolean
          id?: string
          intake_session_id?: string | null
          invite_token?: string
          language?: string
          phone_e164?: string | null
          place_of_birth?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_install_tokens: {
        Row: {
          created_at: string
          expires_at: string
          intake_session_id: string
          role: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          intake_session_id: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          intake_session_id?: string
          role?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      attorney_actions: {
        Row: {
          action: string
          attorney_user_id: string | null
          case_id: string
          created_at: string
          id: string
          metadata: Json
          notes: string | null
        }
        Insert: {
          action: string
          attorney_user_id?: string | null
          case_id: string
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
        }
        Update: {
          action?: string
          attorney_user_id?: string | null
          case_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
        }
        Relationships: []
      }
      case_action_log: {
        Row: {
          completed_by: string | null
          created_at: string
          id: string
          intake_session_id: string
          metadata: Json
          step: string
        }
        Insert: {
          completed_by?: string | null
          created_at?: string
          id?: string
          intake_session_id: string
          metadata?: Json
          step: string
        }
        Update: {
          completed_by?: string | null
          created_at?: string
          id?: string
          intake_session_id?: string
          metadata?: Json
          step?: string
        }
        Relationships: []
      }
      case_tracking: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          inmate_name: string | null
          intake_session_id: string
          language: string
          step1_received_at: string
          step2_sent_to_inmate_at: string | null
          step3_sent_to_family_at: string | null
          tracking_token: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          inmate_name?: string | null
          intake_session_id: string
          language?: string
          step1_received_at?: string
          step2_sent_to_inmate_at?: string | null
          step3_sent_to_family_at?: string | null
          tracking_token?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          inmate_name?: string | null
          intake_session_id?: string
          language?: string
          step1_received_at?: string
          step2_sent_to_inmate_at?: string | null
          step3_sent_to_family_at?: string | null
          tracking_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notify_on_sos: boolean
          phone_e164: string | null
          priority: number
          relationship: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notify_on_sos?: boolean
          phone_e164?: string | null
          priority?: number
          relationship?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notify_on_sos?: boolean
          phone_e164?: string | null
          priority?: number
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_detention_info: {
        Row: {
          a_number: string | null
          arrest_date: string | null
          client_id: string
          created_at: string
          facility_address: string | null
          facility_name: string | null
          federal_id: string | null
          id: string
          located_at: string | null
          located_by: string | null
          notes: string | null
          updated_at: string
          warden_name: string | null
        }
        Insert: {
          a_number?: string | null
          arrest_date?: string | null
          client_id: string
          created_at?: string
          facility_address?: string | null
          facility_name?: string | null
          federal_id?: string | null
          id?: string
          located_at?: string | null
          located_by?: string | null
          notes?: string | null
          updated_at?: string
          warden_name?: string | null
        }
        Update: {
          a_number?: string | null
          arrest_date?: string | null
          client_id?: string
          created_at?: string
          facility_address?: string | null
          facility_name?: string | null
          federal_id?: string | null
          id?: string
          located_at?: string | null
          located_by?: string | null
          notes?: string | null
          updated_at?: string
          warden_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_detention_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          content: string
          created_at: string
          document_type: string
          id: string
          loaded_at: string
          send_on_alert: boolean
          title: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          document_type: string
          id?: string
          loaded_at?: string
          send_on_alert?: boolean
          title: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          loaded_at?: string
          send_on_alert?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_pet_rescue: {
        Row: {
          access_instructions: string | null
          client_id: string
          created_at: string
          id: string
          no_kill_shelter_address: string | null
          no_kill_shelter_preferred: boolean
          notes: string | null
          pet_location: string | null
          pet_name: string | null
          pet_type: string | null
          updated_at: string
          who_to_notify: string | null
        }
        Insert: {
          access_instructions?: string | null
          client_id: string
          created_at?: string
          id?: string
          no_kill_shelter_address?: string | null
          no_kill_shelter_preferred?: boolean
          notes?: string | null
          pet_location?: string | null
          pet_name?: string | null
          pet_type?: string | null
          updated_at?: string
          who_to_notify?: string | null
        }
        Update: {
          access_instructions?: string | null
          client_id?: string
          created_at?: string
          id?: string
          no_kill_shelter_address?: string | null
          no_kill_shelter_preferred?: boolean
          notes?: string | null
          pet_location?: string | null
          pet_name?: string | null
          pet_type?: string | null
          updated_at?: string
          who_to_notify?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_pet_rescue_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sos_alerts: {
        Row: {
          battery_pct: number | null
          cancelled_at: string | null
          client_id: string
          created_at: string
          delivered_at: string | null
          id: string
          lat: number | null
          lng: number | null
          payload: Json | null
          triggered_at: string
        }
        Insert: {
          battery_pct?: number | null
          cancelled_at?: string | null
          client_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          payload?: Json | null
          triggered_at?: string
        }
        Update: {
          battery_pct?: number | null
          cancelled_at?: string | null
          client_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          payload?: Json | null
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sos_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      defendermicasa_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
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
      emergency_activations: {
        Row: {
          a_number: string | null
          act_after: string
          alert_email: string | null
          cancelled_at: string | null
          contact_email: string | null
          created_at: string
          date_of_arrest: string | null
          facility_address: string | null
          facility_name: string | null
          family_notified_at: string | null
          fired_at: string
          full_name: string | null
          gps_lat: number | null
          gps_lng: number | null
          gps_raw: string | null
          id: string
          intake_session_id: string
          ip: string | null
          mailing_label_generated_at: string | null
          notes: string | null
          office_notes: string | null
          role: string
          user_agent: string | null
          warden_name: string | null
        }
        Insert: {
          a_number?: string | null
          act_after: string
          alert_email?: string | null
          cancelled_at?: string | null
          contact_email?: string | null
          created_at?: string
          date_of_arrest?: string | null
          facility_address?: string | null
          facility_name?: string | null
          family_notified_at?: string | null
          fired_at?: string
          full_name?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          gps_raw?: string | null
          id?: string
          intake_session_id: string
          ip?: string | null
          mailing_label_generated_at?: string | null
          notes?: string | null
          office_notes?: string | null
          role: string
          user_agent?: string | null
          warden_name?: string | null
        }
        Update: {
          a_number?: string | null
          act_after?: string
          alert_email?: string | null
          cancelled_at?: string | null
          contact_email?: string | null
          created_at?: string
          date_of_arrest?: string | null
          facility_address?: string | null
          facility_name?: string | null
          family_notified_at?: string | null
          fired_at?: string
          full_name?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          gps_raw?: string | null
          id?: string
          intake_session_id?: string
          ip?: string | null
          mailing_label_generated_at?: string | null
          notes?: string | null
          office_notes?: string | null
          role?: string
          user_agent?: string | null
          warden_name?: string | null
        }
        Relationships: []
      }
      firm_email_whitelist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      intake_pair_logs: {
        Row: {
          code: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          http_status: number | null
          id: string
          intake_session_id: string | null
          payload: Json
        }
        Insert: {
          code?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          http_status?: number | null
          id?: string
          intake_session_id?: string | null
          payload: Json
        }
        Update: {
          code?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          http_status?: number | null
          id?: string
          intake_session_id?: string | null
          payload?: Json
        }
        Relationships: []
      }
      intake_submissions: {
        Row: {
          answers: Json | null
          created_at: string
          email: string | null
          id: string
          language: string
          paid: boolean
          stripe_session_id: string
          updated_at: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string
          paid?: boolean
          stripe_session_id: string
          updated_at?: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string
          paid?: boolean
          stripe_session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_retainers: {
        Row: {
          body_snapshot: string
          created_at: string
          id: string
          intake_session_id: string | null
          ip: string | null
          language: string
          signed_at: string
          signed_name: string
          user_agent: string | null
          user_id: string | null
          version: string
        }
        Insert: {
          body_snapshot: string
          created_at?: string
          id?: string
          intake_session_id?: string | null
          ip?: string | null
          language: string
          signed_at?: string
          signed_name: string
          user_agent?: string | null
          user_id?: string | null
          version: string
        }
        Update: {
          body_snapshot?: string
          created_at?: string
          id?: string
          intake_session_id?: string | null
          ip?: string | null
          language?: string
          signed_at?: string
          signed_name?: string
          user_agent?: string | null
          user_id?: string | null
          version?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string
          id: string
          path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      readiness_deliveries: {
        Row: {
          delivered_at: string
          delivered_to_email: string
          emergency_activation_id: string | null
          id: string
          message_id: string | null
          packet_id: string | null
        }
        Insert: {
          delivered_at?: string
          delivered_to_email: string
          emergency_activation_id?: string | null
          id?: string
          message_id?: string | null
          packet_id?: string | null
        }
        Update: {
          delivered_at?: string
          delivered_to_email?: string
          emergency_activation_id?: string | null
          id?: string
          message_id?: string | null
          packet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "readiness_deliveries_packet_id_fkey"
            columns: ["packet_id"]
            isOneToOne: false
            referencedRelation: "readiness_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness_packets: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_mode: string | null
          designated_recipient: Json | null
          form_answers: Json | null
          generated_pdf_paths: string[] | null
          id: string
          intake_session_id: string
          language: string
          recipient_sent_at: string | null
          recipient_sent_message_id: string | null
          signing_token: string | null
          signing_token_expires_at: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string
          vault_storage_paths: string[] | null
          vault_subscription_id: string | null
          vaulted_at: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_mode?: string | null
          designated_recipient?: Json | null
          form_answers?: Json | null
          generated_pdf_paths?: string[] | null
          id?: string
          intake_session_id: string
          language?: string
          recipient_sent_at?: string | null
          recipient_sent_message_id?: string | null
          signing_token?: string | null
          signing_token_expires_at?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          vault_storage_paths?: string[] | null
          vault_subscription_id?: string | null
          vaulted_at?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_mode?: string | null
          designated_recipient?: Json | null
          form_answers?: Json | null
          generated_pdf_paths?: string[] | null
          id?: string
          intake_session_id?: string
          language?: string
          recipient_sent_at?: string | null
          recipient_sent_message_id?: string | null
          signing_token?: string | null
          signing_token_expires_at?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          vault_storage_paths?: string[] | null
          vault_subscription_id?: string | null
          vaulted_at?: string | null
        }
        Relationships: []
      }
      sms_send_log: {
        Row: {
          body_preview: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          purpose: string
          recipient_phone: string
          status: string
          twilio_sid: string | null
        }
        Insert: {
          body_preview?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          purpose: string
          recipient_phone: string
          status?: string
          twilio_sid?: string | null
        }
        Update: {
          body_preview?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          purpose?: string
          recipient_phone?: string
          status?: string
          twilio_sid?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string | null
          environment: string
          id: string
          language: string | null
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string
          stripe_session_id: string | null
          stripe_subscription_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string | null
          environment?: string
          id?: string
          language?: string | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_session_id?: string | null
          stripe_subscription_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string | null
          environment?: string
          id?: string
          language?: string | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string | null
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
      webhook_send_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          endpoint: string
          error_kind: string | null
          error_message: string | null
          id: string
          intake_session_id: string | null
          ok: boolean
          request_timestamp: string | null
          response_snippet: string | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          endpoint: string
          error_kind?: string | null
          error_message?: string | null
          id?: string
          intake_session_id?: string | null
          ok?: boolean
          request_timestamp?: string | null
          response_snippet?: string | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          endpoint?: string
          error_kind?: string | null
          error_message?: string | null
          id?: string
          intake_session_id?: string | null
          ok?: boolean
          request_timestamp?: string | null
          response_snippet?: string | null
          status_code?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _enqueue_sos_emails: {
        Args: {
          _alert_id: string
          _client_id: string
          _kind: string
          _lat: number
          _lng: number
        }
        Returns: undefined
      }
      cancel_sos_alert: { Args: { _token: string }; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_client_bundle: { Args: { _token: string }; Returns: Json }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      record_sos_alert: {
        Args: {
          _battery_pct?: number
          _lat?: number
          _lng?: number
          _payload?: Json
          _token: string
        }
        Returns: string
      }
      redeem_invite_token: {
        Args: { p_token: string }
        Returns: {
          client_id: string
          full_name: string
          language: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "firm"
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
      app_role: ["admin", "staff", "firm"],
    },
  },
} as const
