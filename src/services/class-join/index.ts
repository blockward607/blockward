
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

      // First try direct database match using DB function
      console.log("[ClassJoinService] Trying direct DB lookup");
      const { data, error } = await supabase
        .rpc('find_classroom_invitation_matches', { code })
        .maybeSingle();

      if (error) {
        console.error("[ClassJoinService] Error finding match via DB function:", error);
      } 
      else if (data) {
        console.log("[ClassJoinService] DB function found match:", data);
        
        // Transform the database result to match JoinClassroomResult interface
        const result: JoinClassroomResult = {
          classroomId: data.classroom_id,
          invitationId: data.id || undefined,
          classroom: {
            id: data.classroom_id,
            name: data.classroom_name || "Classroom",
            description: data.classroom_description || "",
            teacher_id: data.classroom_teacher_id
          }
        };
        
        return { 
          data: result, 
          error: null 
        };
      }
      else {
        console.log("[ClassJoinService] DB function didn't find a match, trying matching service");
      }

      // If DB function didn't find anything, try the other methods
      return await InvitationMatchingService.findClassroomOrInvitation(code);
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
