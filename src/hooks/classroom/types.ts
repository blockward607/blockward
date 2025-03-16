
import { Database } from "@/integrations/supabase/types";

export type Classroom = Database['public']['Tables']['classrooms']['Row'];

export type UserRole = 'teacher' | 'student' | null;
