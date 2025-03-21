
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

// Define the shape of the invitation return type from our custom RPC function
interface InvitationResult {
  id: string;
  classroom_id: string;
  invitation_token: string;
  status: string;
  expires_at: string | null;
}

export const InvitationMatchingService = {
  // Try all possible ways to find a classroom or invitation
  async findClassroomOrInvitation(code: string): Promise<JoinClassResult> {
    // Validate and clean up the code input
    if (!code || typeof code !== 'string') {
      console.error("Invalid code provided:", code);
      return {
        data: null,
        error: { message: "Please provide a valid invitation code" }
      };
    }
    
    console.log("[InvitationMatchingService] Searching for code:", code);
    try {
      // Clean up the code - remove spaces and standardize case for consistency
      const cleanCode = code.replace(/\s+/g, '').trim().toUpperCase();
      
      console.log("[InvitationMatchingService] Cleaned code value:", cleanCode);
      
      // FIRST ATTEMPT: Direct match on invitation_token field
      const { data: exactInvitation, error: exactError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('invitation_token', cleanCode)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (exactError) {
        console.error("[InvitationMatchingService] Error in exact match query:", exactError);
      }
      
      // If we found an exact match, return it immediately
      if (exactInvitation) {
        console.log("[InvitationMatchingService] Found exact invitation match:", exactInvitation);
        
        // Check if invitation is expired
        if (exactInvitation.expires_at && new Date(exactInvitation.expires_at) < new Date()) {
          return { 
            data: null, 
            error: { message: "This invitation has expired. Please request a new one." } 
          };
        }
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', exactInvitation.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: exactInvitation.classroom_id,
            invitationId: exactInvitation.id,
            classroom: classroom ? {
              id: classroom.id,
              name: classroom.name
            } : undefined
          }, 
          error: null 
        };
      }
      
      // SECOND ATTEMPT: Try a direct SQL query to avoid any potential issues with the JS client
      // Use type assertion with the explicit cast to handle the response typing
      const { data: directQueryData, error: directQueryError } = await supabase.rpc(
        'find_invitation_by_code' as any,
        { code_param: cleanCode }
      );
      
      if (directQueryError) {
        console.log("[InvitationMatchingService] Direct query not available, continuing with standard approach");
      } else if (directQueryData && Array.isArray(directQueryData) && directQueryData.length > 0) {
        console.log("[InvitationMatchingService] Found match via direct query:", directQueryData[0]);
        
        // Safely cast the result to our expected type
        const invitationData = directQueryData[0] as InvitationResult;
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', invitationData.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: invitationData.classroom_id,
            invitationId: invitationData.id,
            classroom: classroom ? {
              id: classroom.id,
              name: classroom.name
            } : undefined
          }, 
          error: null 
        };
      }
      
      // THIRD ATTEMPT: Get all pending invitations and do client-side matching
      const { data: allInvitations, error: queryError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending');
        
      if (queryError) {
        console.error("[InvitationMatchingService] Error querying invitations:", queryError);
        return { 
          data: null, 
          error: { message: "Error accessing invitation database: " + queryError.message } 
        };
      }
      
      console.log("[InvitationMatchingService] Found pending invitations:", 
        allInvitations?.map(inv => ({
          token: inv.invitation_token,
          status: inv.status
        }))
      );
      
      // Manual case-insensitive matching against all invitations
      const matchingInvitation = allInvitations?.find(inv => {
        // Clean invitation token the same way for consistent comparison
        const cleanToken = inv.invitation_token.replace(/\s+/g, '').trim().toUpperCase();
        const matched = cleanToken === cleanCode;
        if (matched) {
          console.log("[InvitationMatchingService] MATCH FOUND:", cleanToken, "=", cleanCode);
        }
        return matched;
      });
      
      if (matchingInvitation) {
        console.log("[InvitationMatchingService] Found matching invitation:", matchingInvitation);
        
        // Check if invitation is expired
        if (matchingInvitation.expires_at && new Date(matchingInvitation.expires_at) < new Date()) {
          return { 
            data: null, 
            error: { message: "This invitation has expired. Please request a new one." } 
          };
        }
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', matchingInvitation.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: matchingInvitation.classroom_id,
            invitationId: matchingInvitation.id,
            classroom: classroom ? {
              id: classroom.id,
              name: classroom.name
            } : undefined
          }, 
          error: null 
        };
      }
      
      // FOURTH ATTEMPT: Try as classroom UUID directly
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(cleanCode)) {
        console.log("[InvitationMatchingService] Code appears to be a UUID, checking for direct classroom match");
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', cleanCode)
          .maybeSingle();
          
        if (classroom) {
          return { 
            data: { 
              classroomId: classroom.id,
              invitationId: null,
              classroom: {
                id: classroom.id,
                name: classroom.name
              }
            }, 
            error: null 
          };
        }
      }
      
      // Log all found invitations for debugging again
      console.log("[InvitationMatchingService] No match found among invitations:", allInvitations?.map(i => ({
        token: i.invitation_token,
        cleanToken: i.invitation_token.replace(/\s+/g, '').trim().toUpperCase(),
        searchingFor: cleanCode
      })));
      
      // No match found
      return { 
        data: null, 
        error: { message: "Invalid invitation code. Please check and try again." } 
      };
    } catch (error: any) {
      console.error("[InvitationMatchingService] Unexpected error:", error);
      return { 
        data: null, 
        error: { message: error.message || "Failed to process invitation code" } 
      };
    }
  }
};
