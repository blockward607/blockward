
import { supabase } from "@/integrations/supabase/client";
import { SupabaseError } from "./types";

export const EnrollmentService = {
  /**
   * Check if a student is already enrolled in a specific classroom
   * @param classroomId The ID of the classroom to check enrollment for
   */
  checkEnrollment: async (classroomId: string) => {
    try {
      console.log("[EnrollmentService] Checking enrollment for classroom:", classroomId);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return { 
          data: null, 
          error: { message: "User not authenticated" } as SupabaseError 
        };
      }
      
      // Check if enrollment exists - using the correct table name 'classroom_students'
      const { data, error } = await supabase
        .from("classroom_students")
        .select("*")
        .eq("classroom_id", classroomId)
        .eq("student_id", session.session.user.id);
        
      if (error) {
        console.error("[EnrollmentService] Error checking enrollment:", error);
        return { 
          data: null, 
          error: { message: error.message } as SupabaseError 
        };
      }
      
      console.log("[EnrollmentService] Enrollment check result:", data);
      
      return { 
        data: data, 
        error: null 
      };
    } catch (err: any) {
      console.error("[EnrollmentService] Unexpected error in checkEnrollment:", err);
      return { 
        data: null, 
        error: { message: err.message || "Failed to check enrollment" } as SupabaseError 
      };
    }
  },
  
  /**
   * Enroll a student in a classroom
   * @param classroomId The ID of the classroom to enroll in
   * @param invitationId Optional ID of the invitation being accepted
   */
  enrollStudent: async (classroomId: string, invitationId?: string) => {
    try {
      console.log("[EnrollmentService] Enrolling student in classroom:", classroomId);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return { 
          data: null,
          error: { message: "User not authenticated" } as SupabaseError 
        };
      }
      
      // Use the secure database function to enroll the student
      // This bypasses RLS policies as it's a SECURITY DEFINER function
      let result;
      if (invitationId) {
        // If we have an invitation ID, use the enroll_student function
        result = await supabase.rpc('enroll_student', { 
          invitation_token: invitationId, 
          student_id: session.session.user.id 
        });
      } else {
        // Create enrollment record directly - used as fallback
        result = await supabase
          .from("classroom_students")
          .insert({
            classroom_id: classroomId,
            student_id: session.session.user.id
          })
          .select()
          .single();
      }
      
      const { data, error } = result;
        
      if (error) {
        console.error("[EnrollmentService] Error enrolling student:", error);
        return { 
          data: null,
          error: { message: error.message } as SupabaseError 
        };
      }
      
      console.log("[EnrollmentService] Student successfully enrolled:", data);
      
      return { 
        data: data, 
        error: null 
      };
    } catch (err: any) {
      console.error("[EnrollmentService] Unexpected error in enrollStudent:", err);
      return { 
        data: null,
        error: { message: err.message || "Failed to enroll student" } as SupabaseError 
      };
    }
  },
  
  /**
   * Update invitation status to accepted
   * @param invitationId The ID of the invitation to mark as accepted
   */
  acceptInvitation: async (invitationId: string) => {
    try {
      console.log("[EnrollmentService] Accepting invitation:", invitationId);
      
      const { error } = await supabase
        .from("class_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);
        
      if (error) {
        console.error("[EnrollmentService] Error accepting invitation:", error);
        return { 
          error: { message: error.message } as SupabaseError 
        };
      }
      
      console.log("[EnrollmentService] Invitation successfully accepted");
      
      return { error: null };
    } catch (err: any) {
      console.error("[EnrollmentService] Unexpected error in acceptInvitation:", err);
      return { 
        error: { message: err.message || "Failed to accept invitation" } as SupabaseError 
      };
    }
  }
};
