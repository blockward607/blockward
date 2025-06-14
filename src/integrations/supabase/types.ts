export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
          contract_address: string
          created_at: string | null
          creator_wallet_id: string
          id: string
          image_url: string | null
          metadata: Json
          network: string
          owner_wallet_id: string | null
          token_id: string
          updated_at: string | null
        }
        Insert: {
          contract_address: string
          created_at?: string | null
          creator_wallet_id: string
          id?: string
          image_url?: string | null
          metadata: Json
          network?: string
          owner_wallet_id?: string | null
          token_id: string
          updated_at?: string | null
        }
        Update: {
          contract_address?: string
          created_at?: string | null
          creator_wallet_id?: string
          id?: string
          image_url?: string | null
          metadata?: Json
          network?: string
          owner_wallet_id?: string | null
          token_id?: string
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
          title: string
          type: string | null
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          title: string
          type?: string | null
        }
        Update: {
          classroom_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
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
      students: {
        Row: {
          created_at: string | null
          id: string
          name: string
          points: number | null
          school: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          points?: number | null
          school?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          points?: number | null
          school?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          remaining_credits: number | null
          school: string | null
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
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          created_at: string | null
          id: string
          type: Database["public"]["Enums"]["wallet_type"]
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          type: Database["public"]["Enums"]["wallet_type"]
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["wallet_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_classroom_code: {
        Args: { p_classroom_id: string; p_created_by: string }
        Returns: string
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
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
    }
    Enums: {
      user_role: "teacher" | "student"
      wallet_type: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["teacher", "student"],
      wallet_type: ["user", "admin"],
    },
  },
} as const
