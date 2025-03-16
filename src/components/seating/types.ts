
import { Database } from "@/integrations/supabase/types";

export type Json = Database['public']['Tables']['seating_arrangements']['Row']['layout'];

export interface Student {
  id: string;
  name: string;
}

export interface Seat {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  studentId?: string;
  studentName?: string;
}

export interface SeatingLayout {
  seats: Seat[];
}
