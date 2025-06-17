
export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  school_id: string | null;
  section: string | null;
  created_at: string;
  updated_at: string;
}
