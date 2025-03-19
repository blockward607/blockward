
import { supabase } from '@/integrations/supabase/client';

export const EnrollmentService = {
  // Function to validate if a classroom exists by its ID
  validateClassroom: async (classroomId: string) => {
    console.log('Validating classroom:', classroomId);
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single();
      
    if (error) {
      console.error('Error validating classroom:', error);
      return { valid: false, error };
    }
    
    return { valid: true, data };
  },
  
  // Function to validate if a student exists by ID
  validateStudent: async (studentId: string) => {
    console.log('Validating student:', studentId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
      
    if (error) {
      console.error('Error validating student:', error);
      return { valid: false, error };
    }
    
    return { valid: true, data };
  },
  
  // Function to enroll a student in a classroom
  enrollStudentInClassroom: async (invitationToken: string, studentId: string, classroomId: string) => {
    console.log('Enrolling student in classroom:', { invitationToken, studentId, classroomId });
    
    // Validate that both the classroom and student exist
    const { valid: classroomValid } = await EnrollmentService.validateClassroom(classroomId);
    const { valid: studentValid } = await EnrollmentService.validateStudent(studentId);
    
    if (!classroomValid || !studentValid) {
      return { 
        success: false, 
        error: !classroomValid ? 'Invalid classroom' : 'Invalid student'
      };
    }
    
    // Create enrollment record
    const { data, error } = await supabase
      .from('classroom_students')
      .insert({
        invitation_token: invitationToken,
        student_id: studentId,
        classroom_id: classroomId
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error enrolling student:', error);
      
      // Check if it's a duplicate enrollment
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return { 
          success: false, 
          error: 'Student is already enrolled in this classroom'
        };
      }
      
      return { success: false, error: error.message };
    }
    
    console.log('Student enrolled successfully:', data);
    return { success: true, data };
  }
};
