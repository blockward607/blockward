
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "../types";

/**
 * Attempts to find a case-insensitive exact match for invitations
 */
export const findCaseInsensitiveMatch = async (
  processedCode: string
): Promise<{ data: JoinClassroomResult | null; error: { message: string } | null }> => {
  console.log("[findCaseInsensitiveMatch] Trying case-insensitive exact match for:", processedCode);
  
  const { data: caseInsensitiveInvitations, error: ciError } = await supabase
    .from('class_invitations')
    .select('id, classroom_id, expires_at, status, invitation_token, classroom:classrooms(id, name, description, teacher_id)')
    .filter('invitation_token', 'ilike', processedCode)
    .eq('status', 'pending')
    .limit(1);
    
  if (ciError) {
    console.error("[findCaseInsensitiveMatch] Error with case-insensitive search:", ciError);
    return { 
      data: null, 
      error: { message: "Error checking invitation" } 
    };
  }
  
  if (caseInsensitiveInvitations && caseInsensitiveInvitations.length > 0) {
    const invitation = caseInsensitiveInvitations[0];
    console.log("[findCaseInsensitiveMatch] Found invitation with case-insensitive match:", invitation);
    
    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      return { 
        data: null, 
        error: { message: "This invitation has expired" } 
      };
    }
    
    return { 
      data: {
        classroomId: invitation.classroom_id,
        invitationId: invitation.id,
        classroom: invitation.classroom
      }, 
      error: null 
    };
  }
  
  // No match found with case-insensitive search
  return { data: null, error: null };
};
