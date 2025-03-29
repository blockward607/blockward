
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "../types";

/**
 * Attempts to find a partial match for invitations using case-insensitive search
 */
export const findPartialInvitationMatch = async (
  processedCode: string
): Promise<{ data: JoinClassroomResult | null; error: { message: string } | null }> => {
  // Check if the code matches our expected format before searching
  if (!/^UK[A-Z0-9]{4,6}$/i.test(processedCode)) {
    return { data: null, error: null };
  }
  
  console.log("[findPartialInvitationMatch] Searching for UK-format invitation:", processedCode);
  
  // Try broader search for invitation codes containing the provided code
  // Look for invitation codes using ilike for partial matching
  const { data: ukInvitations, error: ukError } = await supabase
    .from('class_invitations')
    .select('id, classroom_id, expires_at, status, invitation_token, classroom:classrooms(id, name, description, teacher_id)')
    .ilike('invitation_token', processedCode) 
    .eq('status', 'pending')
    .limit(1);
    
  if (ukError) {
    console.error("[findPartialInvitationMatch] Error with partial search:", ukError);
    return { 
      data: null, 
      error: { message: "Error checking invitation" } 
    };
  }
  
  if (ukInvitations && ukInvitations.length > 0) {
    const invitation = ukInvitations[0];
    console.log("[findPartialInvitationMatch] Found invitation with partial match:", invitation);
    
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
  
  // No match found with partial search
  return { data: null, error: null };
};
