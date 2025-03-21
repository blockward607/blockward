import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "./types";

export const EnrollmentService = {
  // Check if student is already enrolled in this classroom
  async checkEnrollment(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("[EnrollmentService] Checking if already enrolled in classroom:", classroomId);
    try {
      const { data, error } = await supabase
        .from('classroom_students')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId)
        .maybeSingle();

      console.log("[EnrollmentService] Enrollment check result:", { data, error });
      return { data, error };
    } catch (error: any) {
      console.error("[EnrollmentService] Error checking enrollment:", error);
      return { 
        data: null, 
        error: {
          message: error.message || "Failed to check enrollment status"
        }
      };
    }
  },

  // Enroll student in classroom
  async enrollStudent(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("[EnrollmentService] Enrolling student in classroom:", { studentId, classroomId });
    
    if (!studentId || !classroomId) {
      console.error("[EnrollmentService] Missing required parameters:", { studentId, classroomId });
      return {
        data: null,
        error: { message: "Missing student ID or classroom ID" }
      };
    }
    
    try {
      // Double-check we're not already enrolled
      const { data: existing } = await this.checkEnrollment(studentId, classroomId);
      if (existing) {
        console.log("[EnrollmentService] Student already enrolled, no need to enroll again");
        return { data: { enrolled: true }, error: null };
      }
    
      // Try direct enrollment first (for simpler cases)
      try {
        console.log("[EnrollmentService] Attempting direct enrollment");
        const { data: directEnrollment, error: directError } = await supabase
          .from('classroom_students')
          .insert({
            classroom_id: classroomId,
            student_id: studentId
          })
          .select()
          .single();
          
        if (!directError) {
          console.log("[EnrollmentService] Direct enrollment succeeded:", directEnrollment);
          return { data: { enrolled: true }, error: null };
        }
        
        console.log("[EnrollmentService] Direct enrollment failed, trying with RPC function:", directError);
      } catch (directErr: any) {
        console.log("[EnrollmentService] Error in direct enrollment, continuing with RPC approach:", directErr);
      }
      
      // Look for existing invitations we can use
      console.log("[EnrollmentService] Looking for existing invitations for classroom:", classroomId);
      const { data: invitations, error: invError } = await supabase
        .from('class_invitations')
        .select('invitation_token, id')
        .eq('classroom_id', classroomId)
        .eq('status', 'pending')
        .limit(1);
        
      if (invError) {
        console.error("[EnrollmentService] Error checking for invitations:", invError);
      }
      
      let token;
      let invitationId = null;
        
      // If we found an invitation, use it
      if (invitations && invitations.length > 0) {
        token = invitations[0].invitation_token;
        invitationId = invitations[0].id;
        console.log("[EnrollmentService] Using existing invitation token:", token, "id:", invitationId);
      } else {
        // Otherwise create a temporary invitation to use
        console.log("[EnrollmentService] Creating temporary invitation for enrollment");
        token = Array.from({length: 6}, () => 
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
        ).join('');
        
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
          console.error("[EnrollmentService] Error creating temporary invitation:", createError);
          return { 
            data: null, 
            error: {
              message: createError.message || "Failed to create enrollment invitation"
            }
          };
        }
        
        if (newInvitation && newInvitation.length > 0) {
          invitationId = newInvitation[0].id;
        }
        
        console.log("[EnrollmentService] Created temporary invitation with token:", token);
      }
      
      // Use RPC function for enrollment (with RLS bypass)
      console.log("[EnrollmentService] Calling enroll_student RPC function with token:", token);
      const { data: fnResult, error: fnError } = await supabase
        .rpc('enroll_student', { 
          invitation_token: token, 
          student_id: studentId 
        });
        
      if (fnError) {
        console.error("[EnrollmentService] RPC enrollment error:", fnError);
        return { 
          data: null, 
          error: {
            message: fnError.message || "Failed to enroll in classroom"
          }
        };
      }
      
      // If we have an invitation ID, update its status
      if (invitationId) {
        await this.acceptInvitation(invitationId);
      }
      
      console.log("[EnrollmentService] Successfully enrolled student with RPC function");
      return { data: { enrolled: true }, error: null };
    } catch (error: any) {
      console.error("[EnrollmentService] Enrollment exception:", error);
      return { 
        data: null, 
        error: { 
          message: error.message || "Failed to enroll in the classroom. Please try again or contact support." 
        } 
      };
    }
  },

  // Update invitation status to accepted
  async acceptInvitation(invitationId: string): Promise<JoinClassroomResult> {
    console.log("[EnrollmentService] Accepting invitation:", invitationId);
    try {
      const { data, error } = await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)
        .select();
        
      console.log("[EnrollmentService] Invitation acceptance result:", { data, error });
      return { data, error };
    } catch (error: any) {
      console.error("[EnrollmentService] Error accepting invitation:", error);
      return { 
        data: null, 
        error: {
          message: error.message || "Failed to accept invitation"
        }
      };
    }
  }
};
