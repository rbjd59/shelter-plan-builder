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
    PostgrestVersion: "14.17"
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
          a_number: string | null
          activated_at: string | null
          attorney_email: string | null
          attorney_name: string | null
          attorney_phone: string | null
          cancel_pin_hash: string | null
          country_of_origin: string | null
          created_at: string
          date_of_birth: string | null
          dead_man_switch_hours: number | null
          device_info: Json | null
          email: string | null
          full_name: string | null
          has_asset_protection: boolean
          has_pet_rescue: boolean
          hmac_secret: string | null
          id: string
          intake_session_id: string | null
          invite_token: string
          language: string
          last_checkin_at: string | null
          phone_e164: string | null
          place_of_birth: string | null
          setup_completed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          a_number?: string | null
          activated_at?: string | null
          attorney_email?: string | null
          attorney_name?: string | null
          attorney_phone?: string | null
          cancel_pin_hash?: string | null
          country_of_origin?: string | null
          created_at?: string
          date_of_birth?: string | null
          dead_man_switch_hours?: number | null
          device_info?: Json | null
          email?: string | null
          full_name?: string | null
          has_asset_protection?: boolean
          has_pet_rescue?: boolean
          hmac_secret?: string | null
          id?: string
          intake_session_id?: string | null
          invite_token: string
          language?: string
          last_checkin_at?: string | null
          phone_e164?: string | null
          place_of_birth?: string | null
          setup_completed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          a_number?: string | null
          activated_at?: string | null
          attorney_email?: string | null
          attorney_name?: string | null
          attorney_phone?: string | null
          cancel_pin_hash?: string | null
          country_of_origin?: string | null
          created_at?: string
          date_of_birth?: string | null
          dead_man_switch_hours?: number | null
          device_info?: Json | null
          email?: string | null
          full_name?: string | null
          has_asset_protection?: boolean
          has_pet_rescue?: boolean
          hmac_secret?: string | null
          id?: string
          intake_session_id?: string | null
          invite_token?: string
          language?: string
          last_checkin_at?: string | null
          phone_e164?: string | null
          place_of_birth?: string | null
          setup_completed_at?: string | null
          updated_at?: string
          user_id?: string | null
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
      app_releases: {
        Row: {
          apk_path: string | null
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          min_android_sdk: number | null
          notes: string | null
          platform: string
          testflight_url: string | null
          updated_at: string
          version: string
        }
        Insert: {
          apk_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          min_android_sdk?: number | null
          notes?: string | null
          platform: string
          testflight_url?: string | null
          updated_at?: string
          version: string
        }
        Update: {
          apk_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          min_android_sdk?: number | null
          notes?: string | null
          platform?: string
          testflight_url?: string | null
          updated_at?: string
          version?: string
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
          role: string
          updated_at: string
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
          role?: string
          updated_at?: string
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
          role?: string
          updated_at?: string
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
          ai_generated: boolean
          ai_model: string | null
          attorney_reviewed_at: string | null
          attorney_reviewed_by: string | null
          client_id: string
          content: string
          created_at: string
          document_type: string
          from_app: boolean
          id: string
          loaded_at: string
          review_notes: string | null
          review_status: string
          send_on_alert: boolean
          storage_path: string | null
          stripe_session_id: string | null
          title: string
        }
        Insert: {
          ai_generated?: boolean
          ai_model?: string | null
          attorney_reviewed_at?: string | null
          attorney_reviewed_by?: string | null
          client_id: string
          content: string
          created_at?: string
          document_type: string
          from_app?: boolean
          id?: string
          loaded_at?: string
          review_notes?: string | null
          review_status?: string
          send_on_alert?: boolean
          storage_path?: string | null
          stripe_session_id?: string | null
          title: string
        }
        Update: {
          ai_generated?: boolean
          ai_model?: string | null
          attorney_reviewed_at?: string | null
          attorney_reviewed_by?: string | null
          client_id?: string
          content?: string
          created_at?: string
          document_type?: string
          from_app?: boolean
          id?: string
          loaded_at?: string
          review_notes?: string | null
          review_status?: string
          send_on_alert?: boolean
          storage_path?: string | null
          stripe_session_id?: string | null
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
          app_reported_a_number: string | null
          app_reported_date_of_birth: string | null
          app_reported_name: string | null
          app_reported_place_of_birth: string | null
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
          app_reported_a_number?: string | null
          app_reported_date_of_birth?: string | null
          app_reported_name?: string | null
          app_reported_place_of_birth?: string | null
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
          app_reported_a_number?: string | null
          app_reported_date_of_birth?: string | null
          app_reported_name?: string | null
          app_reported_place_of_birth?: string | null
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
      client_update_requests: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          request_payload: Json
          reviewed_at: string | null
          reviewed_by: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          request_payload?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          request_payload?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_update_requests_client_id_fkey"
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
      firm_earnings: {
        Row: {
          amount_cents: number
          created_at: string
          earned_at: string
          id: string
          intake_email: string | null
          notes: string | null
          released_to_operating_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          stripe_session_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          earned_at?: string
          id?: string
          intake_email?: string | null
          notes?: string | null
          released_to_operating_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          stripe_session_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          earned_at?: string
          id?: string
          intake_email?: string | null
          notes?: string | null
          released_to_operating_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          stripe_session_id?: string
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
      intake_delivery_log: {
        Row: {
          activation_code: string | null
          client_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          intake_session_id: string | null
          metadata: Json
          status: string
          step: string
          target: string | null
        }
        Insert: {
          activation_code?: string | null
          client_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          intake_session_id?: string | null
          metadata?: Json
          status?: string
          step: string
          target?: string | null
        }
        Update: {
          activation_code?: string | null
          client_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          intake_session_id?: string | null
          metadata?: Json
          status?: string
          step?: string
          target?: string | null
        }
        Relationships: []
      }
      intake_drafts: {
        Row: {
          answers: Json
          approvals: Json
          created_at: string
          english_answers: Json
          language: string
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          approvals?: Json
          created_at?: string
          english_answers?: Json
          language?: string
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          approvals?: Json
          created_at?: string
          english_answers?: Json
          language?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string
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
          packet_generated_at: string | null
          packet_released_at: string | null
          packet_released_by: string | null
          packet_status: string
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
          packet_generated_at?: string | null
          packet_released_at?: string | null
          packet_released_by?: string | null
          packet_status?: string
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
          packet_generated_at?: string | null
          packet_released_at?: string | null
          packet_released_by?: string | null
          packet_status?: string
          paid?: boolean
          stripe_session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_note: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          language: string
          message: string | null
          need: string | null
          phone: string | null
          routed_at: string | null
          routed_to: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_note?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          language?: string
          message?: string | null
          need?: string | null
          phone?: string | null
          routed_at?: string | null
          routed_to?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_note?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          language?: string
          message?: string | null
          need?: string | null
          phone?: string | null
          routed_at?: string | null
          routed_to?: string | null
          source?: string
          status?: string
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
      qualify_submissions: {
        Row: {
          assessment_reasoning: string | null
          attestation_signature: string | null
          attestation_signed: boolean | null
          attestation_signed_at: string | null
          created_at: string
          dependents_count: number | null
          email: string | null
          full_name: string | null
          household_size: number | null
          household_state: string | null
          id: string
          id_document_path: string | null
          id_document_url: string | null
          income_document_path: string | null
          income_document_type: string | null
          income_document_url: string | null
          intake_data: Json | null
          monthly_income_cents: number | null
          notes: string | null
          phone: string | null
          plaid_access_token_encrypted: string | null
          plaid_item_id: string | null
          plaid_linked_at: string | null
          primary_earner: boolean | null
          qualifies: boolean | null
          status: string
          stripe_verification_session_id: string | null
          stripe_verification_status: string | null
          stripe_verification_verified_at: string | null
          support_letter_path: string | null
          support_letter_url: string | null
          tier: string | null
          updated_at: string
          us_citizen_children: boolean | null
          user_id: string | null
        }
        Insert: {
          assessment_reasoning?: string | null
          attestation_signature?: string | null
          attestation_signed?: boolean | null
          attestation_signed_at?: string | null
          created_at?: string
          dependents_count?: number | null
          email?: string | null
          full_name?: string | null
          household_size?: number | null
          household_state?: string | null
          id?: string
          id_document_path?: string | null
          id_document_url?: string | null
          income_document_path?: string | null
          income_document_type?: string | null
          income_document_url?: string | null
          intake_data?: Json | null
          monthly_income_cents?: number | null
          notes?: string | null
          phone?: string | null
          plaid_access_token_encrypted?: string | null
          plaid_item_id?: string | null
          plaid_linked_at?: string | null
          primary_earner?: boolean | null
          qualifies?: boolean | null
          status?: string
          stripe_verification_session_id?: string | null
          stripe_verification_status?: string | null
          stripe_verification_verified_at?: string | null
          support_letter_path?: string | null
          support_letter_url?: string | null
          tier?: string | null
          updated_at?: string
          us_citizen_children?: boolean | null
          user_id?: string | null
        }
        Update: {
          assessment_reasoning?: string | null
          attestation_signature?: string | null
          attestation_signed?: boolean | null
          attestation_signed_at?: string | null
          created_at?: string
          dependents_count?: number | null
          email?: string | null
          full_name?: string | null
          household_size?: number | null
          household_state?: string | null
          id?: string
          id_document_path?: string | null
          id_document_url?: string | null
          income_document_path?: string | null
          income_document_type?: string | null
          income_document_url?: string | null
          intake_data?: Json | null
          monthly_income_cents?: number | null
          notes?: string | null
          phone?: string | null
          plaid_access_token_encrypted?: string | null
          plaid_item_id?: string | null
          plaid_linked_at?: string | null
          primary_earner?: boolean | null
          qualifies?: boolean | null
          status?: string
          stripe_verification_session_id?: string | null
          stripe_verification_status?: string | null
          stripe_verification_verified_at?: string | null
          support_letter_path?: string | null
          support_letter_url?: string | null
          tier?: string | null
          updated_at?: string
          us_citizen_children?: boolean | null
          user_id?: string | null
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
      attach_alert_document: {
        Args: {
          _content: string
          _document_type?: string
          _title: string
          _token: string
        }
        Returns: string
      }
      cancel_sos_alert: { Args: { _token: string }; Returns: string }
      cancel_sos_alert_with_pin: {
        Args: { _pin: string; _token: string }
        Returns: string
      }
      claim_app_client_by_code: {
        Args: { _token: string; _user_id: string }
        Returns: {
          client_id: string
          full_name: string
          invite_token: string
          language: string
        }[]
      }
      claim_app_client_by_email: {
        Args: { _email: string; _user_id: string }
        Returns: {
          client_id: string
          full_name: string
          invite_token: string
          language: string
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_alert_viewer_bundle: { Args: { _token: string }; Returns: Json }
      get_client_bundle: { Args: { p_token: string }; Returns: Json }
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
      redeem_invite_token: { Args: { p_token: string }; Returns: Json }
      set_sos_cancel_pin: {
        Args: { _client_id: string; _pin: string }
        Returns: undefined
      }
      set_sos_cancel_pin_admin: {
        Args: { _client_id: string; _pin: string }
        Returns: undefined
      }
      sync_client_contacts: {
        Args: { _contacts: Json; _token: string }
        Returns: Json
      }
      verify_app_trigger_signature: {
        Args: { _body: string; _signature: string; _token: string }
        Returns: Json
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
