
import { supabase } from "@/integrations/supabase/client";

export interface JoinClassResult {
  data: {
    classroomId: string;
    invitationId: string | null;
    classroom?: {
      id: string;
      name?: string;
    };
  } | null;
  error: { message: string } | null;
}

// Define these as standalone types to avoid circular references
interface ClassroomResponse {
  id: string;
  name?: string;
}

// Avoid circular references by not including the full classroom object
interface InvitationResponse {
  id: string;
  classroom_id: string;
  invitation_token: string;
  status: string;
  expires_at: string | null;
  // Only include the ID for the classroom
  classroom_id_reference?: string;
}

export const InvitationMatchingService = {
  // Try all possible ways to find a classroom or invitation
  async findClassroomOrInvitation(code: string): Promise<JoinClassResult> {
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
        
        // Get classroom details separately to avoid circular reference
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', invitation.classroom_id)
          .maybeSingle();
        
        return { 
          data: { 
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: classroom || undefined
          }, 
          error: null 
        };
      }
      
      // 2. If no direct match, try to find the classroom by code
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('join_code', code)
        .maybeSingle();
        
      console.log("Classroom lookup result:", { classroom, classroomError });
        
      if (classroom) {
        return { 
          data: { 
            classroomId: classroom.id,
            invitationId: null,
            classroom: classroom
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
