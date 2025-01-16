export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      seats: {
        Row: {
          id: number
          student: string | null
          row: number
          column: number
          created_at: string
        }
        Insert: {
          id?: number
          student?: string | null
          row: number
          column: number
          created_at?: string
        }
        Update: {
          id?: number
          student?: string | null
          row?: number
          column?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}