
import { supabase } from "@/integrations/supabase/client";
import { Grade, Assignment, StudentGrade } from "@/services/class-join/types";

export const GradeService = {
  // Get all assignments for a classroom
  async getClassroomAssignments(classroomId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('due_date', { ascending: false });
      
    return { data, error };
  },

  // Get an assignment by ID
  async getAssignment(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();
      
    return { data, error };
  },

  // Create a new assignment
  async createAssignment(assignment: Partial<Assignment>) {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignment)
      .select();
      
    return { data, error };
  },

  // Get grades for a student
  async getStudentGrades(studentId: string, classroomId: string): Promise<StudentGrade[]> {
    try {
      // Get all assignments for the classroom
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('classroom_id', classroomId);
      
      if (assignmentsError) throw assignmentsError;
      if (!assignments) return [];
      
      // Get all grades for the student
      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId);
      
      if (gradesError) throw gradesError;
      
      // Map assignments to grades
      return assignments.map(assignment => {
        const grade = grades?.find(g => g.assignment_id === assignment.id) || null;
        return {
          assignment,
          grade
        };
      });
    } catch (error) {
      console.error("Error fetching student grades:", error);
      return [];
    }
  },

  // Submit a grade for a student
  async submitGrade(grade: Partial<Grade>) {
    // Check if a grade already exists for this student and assignment
    const { data: existingGrade, error: fetchError } = await supabase
      .from('grades')
      .select('id')
      .eq('student_id', grade.student_id)
      .eq('assignment_id', grade.assignment_id)
      .maybeSingle();
    
    if (fetchError) {
      return { data: null, error: fetchError };
    }
    
    if (existingGrade) {
      // Update existing grade
      const { data, error } = await supabase
        .from('grades')
        .update({
          points_earned: grade.points_earned,
          feedback: grade.feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGrade.id)
        .select();
        
      return { data, error };
    } else {
      // Create new grade
      const { data, error } = await supabase
        .from('grades')
        .insert({
          student_id: grade.student_id,
          assignment_id: grade.assignment_id,
          points_earned: grade.points_earned,
          feedback: grade.feedback
        })
        .select();
        
      return { data, error };
    }
  },

  // Get all grades for an assignment
  async getAssignmentGrades(assignmentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        students (
          id,
          name
        )
      `)
      .eq('assignment_id', assignmentId);
      
    return { data, error };
  }
};
