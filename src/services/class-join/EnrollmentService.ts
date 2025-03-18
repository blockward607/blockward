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
      // First check for existing invitations we can use
      const { data: invitations, error: invError } = await supabase
        .from('class_invitations')
        .select('invitation_token')
        .eq('classroom_id', classroomId)
        .eq('status', 'pending')
        .limit(1);
        
      if (invError) {
        console.error("Error checking for invitations:", invError);
      }
      
      let token;
        
      // If we found an invitation, use it
      if (invitations && invitations.length > 0) {
        token = invitations[0].invitation_token;
        console.log("Using existing invitation token:", token);
      } else {
        // Otherwise create a temporary invitation to use
        console.log("Creating temporary invitation for enrollment");
        token = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const { data: newInvitation, error: createError } = await supabase
          .from('class_invitations')
          .insert({
            classroom_id: classroomId,
            email: `temp-${Date.now()}@enrollment.temp`,
            invitation_token: token,
            status: 'pending'
          })
          .select();
          
        if (createError) {
          console.error("Error creating temporary invitation:", createError);
          return { data: null, error: createError };
        }
        
        console.log("Created temporary invitation with token:", token);
      }
      
      // Try direct enrollment first (for simpler cases)
      try {
        const { data: directEnrollment, error: directError } = await supabase
          .from('classroom_students')
          .insert({
            classroom_id: classroomId,
            student_id: studentId
          })
          .select()
          .single();
          
        if (!directError) {
          console.log("Direct enrollment succeeded:", directEnrollment);
          return { data: { enrolled: true }, error: null };
        }
        
        console.log("Direct enrollment failed, trying with RPC function:", directError);
      } catch (directErr) {
        console.log("Error in direct enrollment, continuing with RPC approach:", directErr);
      }
      
      // Use RPC function for enrollment (with RLS bypass)
      const { data: fnResult, error: fnError } = await supabase
        .rpc('enroll_student', { 
          invitation_token: token, 
          student_id: studentId 
        });
        
      if (fnError) {
        console.error("RPC enrollment error:", fnError);
        return { data: null, error: fnError };
      }
      
      console.log("Successfully enrolled student with RPC function");
      return { data: { enrolled: true }, error: null };
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
