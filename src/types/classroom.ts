
export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  school_id?: string;
  section?: string;
  created_at: string;
  updated_at: string;
}
