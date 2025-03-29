
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "../types";

/**
 * Attempts to find an exact match for an invitation by token
 */
export const findExactInvitationMatch = async (
  processedCode: string
): Promise<{ data: JoinClassroomResult | null; error: { message: string } | null }> => {
  // Try to find a match on the exact invitation token
  console.log("[findExactInvitationMatch] Looking for exact match:", processedCode);
  const { data: invitation, error: inviteError } = await supabase
    .from('class_invitations')
    .select('id, classroom_id, expires_at, status, classroom:classrooms(id, name, description, teacher_id)')
    .eq('invitation_token', processedCode)
    .eq('status', 'pending')
    .maybeSingle();
    
  if (inviteError && !inviteError.message.includes('No rows found')) {
    console.error("[findExactInvitationMatch] Error checking invitation:", inviteError);
    return { 
      data: null, 
      error: { message: "Error checking invitation" } 
    };
  }
  
  // If valid invitation found
  if (invitation) {
    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      return { 
        data: null, 
        error: { message: "This invitation has expired" } 
      };
    }
    
    console.log("[findExactInvitationMatch] Found matching invitation:", invitation);
    
    return { 
      data: {
        classroomId: invitation.classroom_id,
        invitationId: invitation.id,
        classroom: invitation.classroom
      }, 
      error: null 
    };
  }
  
  // No exact match found
  return { data: null, error: null };
};
