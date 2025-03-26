
import { supabase } from "@/integrations/supabase/client";
import type { ClassEnrollment, SupabaseError } from "./types";

export const EnrollmentService = {
  /**
   * Checks if a student is already enrolled in a classroom
   */
  async checkEnrollment(studentId: string, classroomId: string) {
    console.log('Checking enrollment:', { studentId, classroomId });
    
    try {
      const { data, error } = await supabase
        .from('classroom_students')
        .select('*')
        .eq('student_id', studentId)
        .eq('classroom_id', classroomId)
        .maybeSingle();
        
      if (error && !error.message.includes('No rows found')) {
        console.error('Error checking enrollment:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Exception checking enrollment:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Error checking enrollment' 
        } as SupabaseError 
      };
    }
  },
  
  /**
   * Enrolls a student in a classroom
   */
  async enrollStudent(studentId: string, classroomId: string) {
    console.log('Enrolling student:', { studentId, classroomId });
    
    try {
      const { data, error } = await supabase
        .from('classroom_students')
        .insert({
          student_id: studentId,
          classroom_id: classroomId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error enrolling student:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Exception enrolling student:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Error enrolling student' 
        } as SupabaseError 
      };
    }
  },
  
  /**
   * Accept an invitation (mark it as accepted)
   */
  async acceptInvitation(invitationId: string) {
    console.log('Accepting invitation:', invitationId);
    
    try {
      const { data, error } = await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)
        .select()
        .single();
        
      if (error) {
        console.error('Error accepting invitation:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Exception accepting invitation:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Error accepting invitation' 
        } as SupabaseError 
      };
    }
  }
};
