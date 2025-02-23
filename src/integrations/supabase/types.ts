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
      enroll_student: {
        Args: {
          invitation_token: string
          student_id: string
        }
        Returns: undefined
      }
      increment_student_points: {
        Args: {
          student_id: string
          points_to_add: number
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
