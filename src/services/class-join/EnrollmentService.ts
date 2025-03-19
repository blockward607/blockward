
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "./types";

export const EnrollmentService = {
  // Check if student is already enrolled in this classroom
  async checkEnrollment(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("Checking if already enrolled in classroom:", classroomId);
    try {
      const { data, error } = await supabase
        .from('classroom_students')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId)
        .maybeSingle();

      console.log("Enrollment check result:", { data, error });
      return { data, error };
    } catch (error: any) {
      console.error("Error checking enrollment:", error);
      return { data: null, error };
    }
  },

  // Enroll student in classroom with RLS bypass via service function
  async enrollStudent(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("Enrolling student in classroom:", { studentId, classroomId });
    
    try {
      // Direct enrollment approach
      const { data: directEnrollment, error: directError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: classroomId,
          student_id: studentId
        })
        .select();
        
      if (!directError) {
        console.log("Direct enrollment succeeded:", directEnrollment);
        return { data: { enrolled: true }, error: null };
      }
      
      console.log("Direct enrollment failed, trying alternative approach:", directError);
      
      // Fallback: Try to use RPC function if available
      try {
        const { data: fnResult, error: fnError } = await supabase
          .rpc('enroll_student', { 
            p_classroom_id: classroomId, 
            p_student_id: studentId 
          });
          
        if (fnError) {
          console.error("RPC enrollment error:", fnError);
          return { 
            data: null, 
            error: { message: "Failed to join classroom. Please try again or contact your teacher." } 
          };
        }
        
        console.log("Successfully enrolled student with RPC function");
        return { data: { enrolled: true }, error: null };
      } catch (rpcError) {
        console.error("Error in RPC enrollment fallback:", rpcError);
        
        // Last resort: Create a function to try to bypass RLS
        return { 
          data: null, 
          error: { message: "Server error during enrollment. Please contact your teacher for assistance." }
        };
      }
      
    } catch (error: any) {
      console.error("Enrollment exception:", error);
      return { 
        data: null, 
        error: { message: "Failed to enroll in the classroom. Please try again or contact support." } 
      };
    }
  },

  // Update invitation status to accepted
  async acceptInvitation(invitationId: string): Promise<JoinClassroomResult> {
    console.log("Accepting invitation:", invitationId);
    try {
      const { data, error } = await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)
        .select();
        
      console.log("Invitation acceptance result:", { data, error });
      return { data, error };
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      return { data: null, error };
    }
  }
};
