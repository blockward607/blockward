
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "../types";
import { normalizeCode } from "./extractCode";

export const findExactInvitationMatch = async (code: string): Promise<{
  data: JoinClassroomResult | null;
  error: { message: string } | null;
}> => {
  try {
    if (!code) {
      return {
        data: null,
        error: { message: "No invitation code provided" }
      };
    }
    
    const normalizedCode = normalizeCode(code);
    console.log("[findExactInvitationMatch] Looking for invitation with normalized code:", normalizedCode);
    
    // Look for a case-insensitive match
    const { data: invitations, error: invitationError } = await supabase
      .from("class_invitations")
      .select("id, classroom_id, invitation_token, status, expires_at, classroom:classrooms(*)")
      .ilike("invitation_token", normalizedCode)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .limit(1);

    if (invitationError) {
      console.error("[findExactInvitationMatch] Error:", invitationError);
      return {
        data: null,
        error: {
          message: invitationError.message || "Error finding invitation"
        }
      };
    }

    if (!invitations || invitations.length === 0) {
      return {
        data: null,
        error: { message: "Invitation not found or expired" }
      };
    }

    const invitation = invitations[0];
    console.log("[findExactInvitationMatch] Found invitation:", invitation);

    return {
      data: {
        classroomId: invitation.classroom_id,
        invitationId: invitation.id,
        classroom: invitation.classroom
      },
      error: null
    };
  } catch (error: any) {
    console.error("[findExactInvitationMatch] Unexpected error:", error);
    return {
      data: null,
      error: { message: error.message || "Unexpected error finding invitation" }
    };
  }
};
