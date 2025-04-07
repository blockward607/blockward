
import { supabase } from "@/integrations/supabase/client";
import { ClassEnrollment } from "./types";

export const EnrollmentService = {
  // Check if a student is already enrolled in a classroom
  checkEnrollment: async (classroomId: string): Promise<{
    data: ClassEnrollment[] | null;
    error: any;
  }> => {
    try {
      console.log("[EnrollmentService] Checking enrollment for classroom:", classroomId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        return {
          data: null,
          error: { message: "User not authenticated" }
        };
      }

      // Get the student ID for this user
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (studentError || !studentData) {
        console.error("[EnrollmentService] Error getting student ID:", studentError);
        return {
          data: null,
          error: studentError || { message: "Student profile not found" }
        };
      }

      // Check if the student is already enrolled
      const { data, error } = await supabase
        .from("classroom_students")
        .select("*")
        .eq("classroom_id", classroomId)
        .eq("student_id", studentData.id);

      if (error) {
        console.error("[EnrollmentService] Error checking enrollment:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("[EnrollmentService] Unexpected error:", error);
      return {
        data: null,
        error: { message: error.message || "Unexpected error checking enrollment" }
      };
    }
  },

  // Enroll a student in a classroom
  enrollStudent: async (
    classroomId: string, 
    invitationId?: string
  ): Promise<{
    data: any;
    error: any;
  }> => {
    try {
      console.log("[EnrollmentService] Enrolling in classroom:", classroomId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        return {
          data: null,
          error: { message: "User not authenticated" }
        };
      }

      // Get the student ID for this user
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (studentError || !studentData) {
        console.error("[EnrollmentService] Error getting student ID:", studentError);
        return {
          data: null,
          error: studentError || { message: "Student profile not found" }
        };
      }

      // Try to use the security definer RPC function first for enrolling
      if (invitationId) {
        try {
          // If we have an invitation, use the specialized enroll function
          const { data: enrollData, error: enrollError } = await supabase
            .rpc('enroll_student', { 
              invitation_token: invitationId,
              student_id: studentData.id 
            });

          if (!enrollError) {
            return { data: enrollData, error: null };
          } else {
            console.warn("[EnrollmentService] RPC enroll failed, falling back to direct insert:", enrollError);
          }
        } catch (rpcError) {
          console.warn("[EnrollmentService] RPC enroll function error, using direct insert:", rpcError);
          // Continue to direct insert as fallback
        }
      }

      // Directly insert the enrollment record as fallback
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("classroom_students")
        .insert({
          classroom_id: classroomId,
          student_id: studentData.id
        })
        .select();

      if (enrollmentError) {
        console.error("[EnrollmentService] Error enrolling student:", enrollmentError);
        return { data: null, error: enrollmentError };
      }

      // If an invitation ID was provided, mark it as accepted
      if (invitationId) {
        await EnrollmentService.acceptInvitation(invitationId);
      }

      return { data: enrollmentData, error: null };
    } catch (error: any) {
      console.error("[EnrollmentService] Unexpected error:", error);
      return {
        data: null,
        error: { message: error.message || "Unexpected error enrolling student" }
      };
    }
  },

  // Update invitation status to accepted
  acceptInvitation: async (
    invitationId: string
  ): Promise<{
    data: any;
    error: any;
  }> => {
    try {
      console.log("[EnrollmentService] Accepting invitation:", invitationId);
      
      const { data, error } = await supabase
        .from("class_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId)
        .select();

      if (error) {
        console.error("[EnrollmentService] Error accepting invitation:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("[EnrollmentService] Unexpected error:", error);
      return {
        data: null,
        error: { message: error.message || "Unexpected error accepting invitation" }
      };
    }
  }
};
