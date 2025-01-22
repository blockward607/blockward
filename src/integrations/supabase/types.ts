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
      behavior_records: {
        Row: {
          created_at: string | null
          description: string
          id: string
          points: number
          student_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          points: number
          student_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          points?: number
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
      nfts: {
        Row: {
          contract_address: string
          created_at: string | null
          creator_wallet_id: string | null
          id: string
          metadata: Json
          network: string
          owner_wallet_id: string | null
          token_id: string
          updated_at: string | null
        }
        Insert: {
          contract_address: string
          created_at?: string | null
          creator_wallet_id?: string | null
          id?: string
          metadata: Json
          network: string
          owner_wallet_id?: string | null
          token_id: string
          updated_at?: string | null
        }
        Update: {
          contract_address?: string
          created_at?: string | null
          creator_wallet_id?: string | null
          id?: string
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
      students: {
        Row: {
          created_at: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
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
          from_wallet_id: string | null
          id: string
          nft_id: string | null
          status: string
          to_wallet_id: string | null
          transaction_hash: string
        }
        Insert: {
          created_at?: string | null
          from_wallet_id?: string | null
          id?: string
          nft_id?: string | null
          status: string
          to_wallet_id?: string | null
          transaction_hash: string
        }
        Update: {
          created_at?: string | null
          from_wallet_id?: string | null
          id?: string
          nft_id?: string | null
          status?: string
          to_wallet_id?: string | null
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
      wallets: {
        Row: {
          address: string
          created_at: string | null
          id: string
          type: Database["public"]["Enums"]["wallet_type"]
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          type: Database["public"]["Enums"]["wallet_type"]
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          type?: Database["public"]["Enums"]["wallet_type"]
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
