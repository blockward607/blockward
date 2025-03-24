
export interface JoinClassroomResult {
  data: any;
  error: any;
}

export interface ClassInvitation {
  id: string;
  code: string;
  classroomId: string;
  classroomName: string;
}

export interface Grade {
  id: string;
  student_id: string;
  assignment_id: string;
  points_earned: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  classroom_id: string;
  points_possible: number;
  due_date?: string;
}

export interface StudentGrade {
  assignment: Assignment;
  grade: Grade | null;
}
