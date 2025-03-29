import { supabase } from "@/integrations/supabase/client";
import { EnrollmentService } from './EnrollmentService';
import { InvitationMatchingService } from './invitation/InvitationMatchingService';
import { JoinClassroomResult } from './types';

export const ClassJoinService = {
  // Check if student is already enrolled in this classroom
  checkEnrollment: EnrollmentService.checkEnrollment,
  
  // Enroll student in classroom with RLS bypass via service function
  enrollStudent: EnrollmentService.enrollStudent,
  
  // Update invitation status to accepted
  acceptInvitation: EnrollmentService.acceptInvitation,
  
  // Try all possible ways to find a classroom or invitation
  findClassroomOrInvitation: async (
    code: string
  ): Promise<{ 
    data: JoinClassroomResult | null; 
    error: { message: string } | null 
  }> => {
    try {
      console.log("[ClassJoinService] Finding classroom or invitation for code:", code);
      
      if (!code) {
        return { 
          data: null, 
          error: { message: "No invitation code provided" } 
        };
      }

      // Use the new database function to find matches
      const { data, error } = await supabase
        .rpc('find_classroom_invitation_matches', { code })
        .single();

      if (error) {
        console.error("[ClassJoinService] Error finding match:", error);
        return { 
          data: null, 
          error: { message: error.message || "Error finding classroom or invitation" } 
        };
      }

      if (!data) {
        console.log("[ClassJoinService] No matching invitation or classroom found for:", code);
        return { 
          data: null, 
          error: { message: "Invalid or expired invitation code" } 
        };
      }

      // Transform the database result to match JoinClassroomResult interface
      const result: JoinClassroomResult = {
        classroomId: data.classroom_id,
        invitationId: data.id || undefined,
        classroom: data.id ? {
          id: data.classroom_id,
          name: data.classroom_name,
          description: data.classroom_description,
          teacher_id: data.classroom_teacher_id
        } : undefined
      };

      console.log("[ClassJoinService] Match found:", result);
      
      return { 
        data: result, 
        error: null 
      };
    } catch (err: any) {
      console.error("[ClassJoinService] Unexpected error:", err);
      return { 
        data: null, 
        error: { message: err.message || "Something went wrong. Please try again." } 
      };
    }
  },
  
  // Utility to extract code from various input formats
  extractCodeFromInput: InvitationMatchingService.extractCodeFromInput
};

export type { JoinClassroomResult };
