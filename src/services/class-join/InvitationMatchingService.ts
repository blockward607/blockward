
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "./types";

export const InvitationMatchingService = {
  // Try all possible ways to find a classroom or invitation
  async findClassroomOrInvitation(code: string): Promise<JoinClassroomResult> {
    console.log("Trying to find classroom or invitation with code:", code);
    try {
      // 1. First try to find a direct class invitation by token
      const { data: invitation, error: invitationError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('invitation_token', code)
        .eq('status', 'pending')
        .maybeSingle();
        
      console.log("Invitation lookup result:", { invitation, invitationError });
        
      if (invitation) {
        // Check if invitation is expired
        if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
          return { 
            data: null, 
            error: { message: "This invitation has expired. Please request a new one." } 
          };
        }
        
        return { 
          data: { 
            classroomId: invitation.classroom_id,
            invitationId: invitation.id
          }, 
          error: null 
        };
      }
      
      // 2. If no direct match, try to find the classroom by code
      // This is a fallback for older class codes that might have been stored differently
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('join_code', code)  // Assumes there might be a join_code column on classrooms
        .maybeSingle();
        
      console.log("Classroom lookup result:", { classroom, classroomError });
        
      if (classroom) {
        return { 
          data: { 
            classroomId: classroom.id,
            invitationId: null
          }, 
          error: null 
        };
      }
      
      // 3. If nothing found, return null data
      console.log("No valid invitation or classroom found with code:", code);
      return { 
        data: null, 
        error: { message: "Invalid invitation code. Please check and try again." } 
      };
    } catch (error: any) {
      console.error("Error in findClassroomOrInvitation:", error);
      return { 
        data: null, 
        error: { message: error.message || "Failed to process invitation code" } 
      };
    }
  }
};
