export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string | null
          criteria: string | null
          description: string
          icon: string
          id: string
          points: number
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criteria?: string | null
          description: string
          icon: string
          id?: string
          points?: number
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: string | null
          description?: string
          icon?: string
          id?: string
          points?: number
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_buttons: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          route: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          route: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          route?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          school_id: string
          title: string
          type: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          school_id: string
          title: string
          type: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          school_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          access_level: Database["public"]["Enums"]["admin_access_level"] | null
          created_at: string | null
          full_name: string | null
          id: string
          permissions: Json | null
          position: string | null
          school_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?:
            | Database["public"]["Enums"]["admin_access_level"]
            | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          permissions?: Json | null
          position?: string | null
          school_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?:
            | Database["public"]["Enums"]["admin_access_level"]
            | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          permissions?: Json | null
          position?: string | null
          school_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_code: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_code?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_wallet_config: {
        Row: {
          contract_address: string | null
          created_at: string
          encrypted_private_key: string
          encryption_salt: string
          id: string
          is_active: boolean
          network_name: string
          wallet_address: string
        }
        Insert: {
          contract_address?: string | null
          created_at?: string
          encrypted_private_key: string
          encryption_salt: string
          id?: string
          is_active?: boolean
          network_name?: string
          wallet_address: string
        }
        Update: {
          contract_address?: string | null
          created_at?: string
          encrypted_private_key?: string
          encryption_salt?: string
          id?: string
          is_active?: boolean
          network_name?: string
          wallet_address?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          points_possible: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          date: string | null
          id: string
          notes: string | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          school_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          school_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          school_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          points: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          points?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          points?: number | null
          type?: string
        }
        Relationships: []
      }
      behavior_records: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          location: string | null
          parent_notified: boolean | null
          points: number
          resolved: boolean | null
          severity: number | null
          student_id: string | null
          type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          location?: string | null
          parent_notified?: boolean | null
          points: number
          resolved?: boolean | null
          severity?: number | null
          student_id?: string | null
          type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          location?: string | null
          parent_notified?: boolean | null
          points?: number
          resolved?: boolean | null
          severity?: number | null
          student_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behavior_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_transactions: {
        Row: {
          confirmed_at: string | null
          created_at: string
          from_address: string
          gas_price: number | null
          gas_used: number | null
          id: string
          nft_id: string | null
          status: string
          to_address: string
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          from_address: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          nft_id?: string | null
          status?: string
          to_address: string
          transaction_hash: string
          transaction_type: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          from_address?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          nft_id?: string | null
          status?: string
          to_address?: string
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_transactions_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      class_invitations: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_token: string | null
          status: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          status?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_invitations_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_codes: {
        Row: {
          classroom_id: string
          code: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number | null
          usage_count: number
        }
        Insert: {
          classroom_id: string
          code: string
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          usage_count?: number
        }
        Update: {
          classroom_id?: string
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "classroom_codes_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_students: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          id: string
          seat_number: number | null
          student_id: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          id?: string
          seat_number?: number | null
          student_id?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          id?: string
          seat_number?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          section: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          section?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          section?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      encrypted_wallets: {
        Row: {
          created_at: string
          encrypted_private_key: string
          encryption_salt: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          encrypted_private_key: string
          encryption_salt: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          encrypted_private_key?: string
          encryption_salt?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          id: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assignment_id: string | null
          created_at: string | null
          feedback: string | null
          id: string
          points_earned: number | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          points_earned?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          points_earned?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homerooms: {
        Row: {
          created_at: string | null
          form_tutor_id: string | null
          id: string
          name: string
          room_number: string | null
          school_id: string
          updated_at: string | null
          year_group: string | null
        }
        Insert: {
          created_at?: string | null
          form_tutor_id?: string | null
          id?: string
          name: string
          room_number?: string | null
          school_id: string
          updated_at?: string | null
          year_group?: string | null
        }
        Update: {
          created_at?: string | null
          form_tutor_id?: string | null
          id?: string
          name?: string
          room_number?: string | null
          school_id?: string
          updated_at?: string | null
          year_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homerooms_form_tutor_id_fkey"
            columns: ["form_tutor_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homerooms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
          sender_role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
          sender_role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      nfts: {
        Row: {
          blockchain_status: string | null
          blockchain_token_id: number | null
          contract_address: string
          created_at: string | null
          creator_wallet_id: string
          id: string
          image_url: string | null
          metadata: Json
          minted_at: string | null
          network: string
          owner_wallet_id: string | null
          token_id: string
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          blockchain_status?: string | null
          blockchain_token_id?: number | null
          contract_address: string
          created_at?: string | null
          creator_wallet_id: string
          id?: string
          image_url?: string | null
          metadata: Json
          minted_at?: string | null
          network?: string
          owner_wallet_id?: string | null
          token_id: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          blockchain_status?: string | null
          blockchain_token_id?: number | null
          contract_address?: string
          created_at?: string | null
          creator_wallet_id?: string
          id?: string
          image_url?: string | null
          metadata?: Json
          minted_at?: string | null
          network?: string
          owner_wallet_id?: string | null
          token_id?: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfts_creator_wallet_id_fkey"
            columns: ["creator_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfts_owner_wallet_id_fkey"
            columns: ["owner_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          recipients: Json | null
          title: string
          type: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          recipients?: Json | null
          title: string
          type?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          recipients?: Json | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      parent_student_relationships: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string | null
          relationship_type: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          relationship_type?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          relationship_type?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_users: {
        Row: {
          additional_info: Json | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          institution_code: string | null
          rejection_reason: string | null
          role: string
          school_id: string | null
          status: string
        }
        Insert: {
          additional_info?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          institution_code?: string | null
          rejection_reason?: string | null
          role: string
          school_id?: string | null
          status?: string
        }
        Update: {
          additional_info?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          institution_code?: string | null
          rejection_reason?: string | null
          role?: string
          school_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_users_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          id: string
          options: Json | null
          points: number | null
          question: string
          question_type: string | null
          quiz_id: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question: string
          question_type?: string | null
          quiz_id?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question?: string
          question_type?: string | null
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          answers: Json | null
          id: string
          quiz_id: string | null
          score: number | null
          student_id: string | null
          submitted_at: string | null
        }
        Insert: {
          answers?: Json | null
          id?: string
          quiz_id?: string | null
          score?: number | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          answers?: Json | null
          id?: string
          quiz_id?: string | null
          score?: number | null
          student_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          description: string | null
          id: string
          points_possible: number | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points_possible?: number | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points_possible?: number | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          classroom_id: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          type: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string | null
          created_by: string | null
          domain: string | null
          id: string
          institution_code: string | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          domain?: string | null
          id?: string
          institution_code?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          domain?: string | null
          id?: string
          institution_code?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      seating_arrangements: {
        Row: {
          active: boolean | null
          classroom_id: string | null
          created_at: string | null
          id: string
          layout: Json
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          classroom_id?: string | null
          created_at?: string | null
          id?: string
          layout?: Json
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          classroom_id?: string | null
          created_at?: string | null
          id?: string
          layout?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seating_arrangements_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_feedback: {
        Row: {
          category: string
          created_at: string
          feedback_text: string
          id: string
          rating: number | null
          student_id: string
          teacher_id: string
          teacher_name: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          feedback_text: string
          id?: string
          rating?: number | null
          student_id: string
          teacher_id: string
          teacher_name?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          feedback_text?: string
          id?: string
          rating?: number | null
          student_id?: string
          teacher_id?: string
          teacher_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_feedback_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_homeroom_assignments: {
        Row: {
          academic_year: string
          assigned_at: string | null
          assigned_by: string
          homeroom_id: string
          id: string
          is_active: boolean | null
          student_id: string
        }
        Insert: {
          academic_year: string
          assigned_at?: string | null
          assigned_by: string
          homeroom_id: string
          id?: string
          is_active?: boolean | null
          student_id: string
        }
        Update: {
          academic_year?: string
          assigned_at?: string | null
          assigned_by?: string
          homeroom_id?: string
          id?: string
          is_active?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_homeroom_assignments_homeroom_id_fkey"
            columns: ["homeroom_id"]
            isOneToOne: false
            referencedRelation: "homerooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_homeroom_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          id: string
          name: string
          points: number | null
          school: string | null
          school_id: string
          user_id: string | null
          year_group_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          points?: number | null
          school?: string | null
          school_id: string
          user_id?: string | null
          year_group_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          points?: number | null
          school?: string | null
          school_id?: string
          user_id?: string | null
          year_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_year_group_id_fkey"
            columns: ["year_group_id"]
            isOneToOne: false
            referencedRelation: "year_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
        }
        Insert: {
          code?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
        }
        Update: {
          code?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          school_id: string | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          school_id?: string | null
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          school_id?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_class_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          assignment_type: string
          classroom_id: string
          id: string
          is_active: boolean | null
          teacher_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          assignment_type?: string
          classroom_id: string
          id?: string
          is_active?: boolean | null
          teacher_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          assignment_type?: string
          classroom_id?: string
          id?: string
          is_active?: boolean | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_class_assignments_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          remaining_credits: number | null
          school: string | null
          school_id: string
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          remaining_credits?: number | null
          school?: string | null
          school_id: string
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          remaining_credits?: number | null
          school?: string | null
          school_id?: string
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          from_wallet_id: string
          id: string
          nft_id: string
          status: string
          to_wallet_id: string
          transaction_hash: string
        }
        Insert: {
          created_at?: string | null
          from_wallet_id: string
          id?: string
          nft_id: string
          status?: string
          to_wallet_id: string
          transaction_hash: string
        }
        Update: {
          created_at?: string | null
          from_wallet_id?: string
          id?: string
          nft_id?: string
          status?: string
          to_wallet_id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          compact_view: boolean | null
          created_at: string | null
          dark_mode: boolean | null
          id: string
          tutorial_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compact_view?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          id?: string
          tutorial_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compact_view?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          id?: string
          tutorial_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          created_at: string | null
          encrypted_wallet_id: string | null
          id: string
          is_blockchain_wallet: boolean | null
          type: Database["public"]["Enums"]["wallet_type"]
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          encrypted_wallet_id?: string | null
          id?: string
          is_blockchain_wallet?: boolean | null
          type: Database["public"]["Enums"]["wallet_type"]
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          encrypted_wallet_id?: string | null
          id?: string
          is_blockchain_wallet?: boolean | null
          type?: Database["public"]["Enums"]["wallet_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_encrypted_wallet_id_fkey"
            columns: ["encrypted_wallet_id"]
            isOneToOne: false
            referencedRelation: "encrypted_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      year_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "year_groups_school_id_fkey"
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
      admin_create_institution_code: {
        Args: {
          p_school_name: string
          p_contact_email?: string
          p_admin_name?: string
        }
        Returns: Json
      }
      assign_teacher_to_classroom: {
        Args: {
          p_teacher_id: string
          p_classroom_id: string
          p_assignment_type?: string
        }
        Returns: boolean
      }
      can_promote_to_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      create_classroom_code: {
        Args: { p_classroom_id: string; p_created_by: string }
        Returns: string
      }
      create_homeroom: {
        Args: {
          p_name: string
          p_year_group: string
          p_form_tutor_id?: string
          p_room_number?: string
        }
        Returns: string
      }
      create_pending_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_role: string
          p_institution_code?: string
          p_additional_info?: Json
        }
        Returns: Json
      }
      enroll_student: {
        Args: { invitation_token: string; student_id: string }
        Returns: undefined
      }
      find_classroom_invitation_matches: {
        Args: { code: string }
        Returns: {
          id: string
          invitation_token: string
          classroom_id: string
          expires_at: string
          status: string
          classroom_name: string
          classroom_description: string
          classroom_teacher_id: string
          match_type: string
        }[]
      }
      generate_classroom_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_institution_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_institution_codes: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          institution_code: string
          contact_email: string
          created_at: string
          student_count: number
          teacher_count: number
        }[]
      }
      get_conversation_messages: {
        Args: { conversation_id_param: string }
        Returns: {
          id: string
          conversation_id: string
          sender_id: string
          sender_role: string
          content: string
          created_at: string
          read: boolean
          sender_name: string
        }[]
      }
      get_system_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          setting_key: string
          setting_value: Json
        }[]
      }
      get_user_conversations: {
        Args: { user_id_param: string }
        Returns: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }[]
      }
      increment_student_points: {
        Args: { student_id: string; points_to_add: number }
        Returns: undefined
      }
      join_classroom_with_code: {
        Args: { p_code: string; p_student_id: string }
        Returns: Json
      }
      mark_messages_as_read: {
        Args: { message_ids: string[]; user_id_param: string }
        Returns: undefined
      }
      process_pending_user: {
        Args: {
          p_pending_user_id: string
          p_action: string
          p_rejection_reason?: string
        }
        Returns: Json
      }
      promote_user_to_admin: {
        Args: {
          target_user_id: string
          school_id_param?: string
          admin_name?: string
          admin_position?: string
        }
        Returns: boolean
      }
      send_message: {
        Args: {
          conversation_id_param: string
          content_param: string
          sender_id_param: string
          sender_role_param: string
        }
        Returns: string
      }
      update_conversation_timestamp: {
        Args: { conversation_id_param: string }
        Returns: undefined
      }
      update_system_setting: {
        Args: { p_setting_key: string; p_setting_value: Json }
        Returns: boolean
      }
      validate_institution_code: {
        Args: { code: string }
        Returns: Json
      }
    }
    Enums: {
      admin_access_level:
        | "super_admin"
        | "ict_admin"
        | "head_teacher"
        | "department_head"
        | "form_tutor"
      app_role: "admin" | "teacher" | "student"
      user_role: "teacher" | "student"
      user_role_enum: "student" | "teacher" | "admin"
      wallet_type: "user" | "admin"
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
      admin_access_level: [
        "super_admin",
        "ict_admin",
        "head_teacher",
        "department_head",
        "form_tutor",
      ],
      app_role: ["admin", "teacher", "student"],
      user_role: ["teacher", "student"],
      user_role_enum: ["student", "teacher", "admin"],
      wallet_type: ["user", "admin"],
    },
  },
} as const
