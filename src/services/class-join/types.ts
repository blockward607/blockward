
// Types for class join functionality

export interface JoinClassroomResult {
  // Unique class ID that the student will join
  classroomId: string;
  
  // If joining through an invitation, this contains the invitation ID
  invitationId?: string;
  
  // Full classroom data if available
  classroom?: {
    id: string;
    name: string;
    description?: string;
    teacher_id?: string;
  };
}

export interface ClassInvitation {
  id: string;
  invitation_token: string;
  classroom_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  expires_at: string;
  created_at?: string;
}

export interface ClassEnrollment {
  id: string;
  classroom_id: string;
  student_id: string;
  created_at?: string;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacher_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Grade related interfaces for the grading system
export interface Grade {
  id: string;
  student_id: string;
  assignment_id: string;
  points_earned: number;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  points_possible: number;
  due_date?: string;
  classroom_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentGrade {
  assignment: Assignment;
  grade: Grade | null;
}
