
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

// Define the shape of the invitation return type for the database query
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
      const cleanCode = code.trim().toUpperCase();
      
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
      
      // SECOND ATTEMPT: Try direct SQL query using our custom function
      // Instead of using RPC, we'll use a direct query as a workaround for the type issue
      console.log("[InvitationMatchingService] Trying direct query with code:", cleanCode);
      
      const { data: directQueryData, error: directQueryError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending')
        .ilike('invitation_token', cleanCode)
        .maybeSingle();
      
      if (directQueryError) {
        console.log("[InvitationMatchingService] Direct query error:", directQueryError);
      } else if (directQueryData) {
        console.log("[InvitationMatchingService] Found match via direct query:", directQueryData);
        
        // Check if invitation is expired
        if (directQueryData.expires_at && new Date(directQueryData.expires_at) < new Date()) {
          return { 
            data: null, 
            error: { message: "This invitation has expired. Please request a new one." } 
          };
        }
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', directQueryData.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: directQueryData.classroom_id,
            invitationId: directQueryData.id,
            classroom: classroom ? {
              id: classroom.id,
              name: classroom.name
            } : undefined
          }, 
          error: null 
        };
      }
      
      // THIRD ATTEMPT: Try as classroom UUID directly
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
      
      // FOURTH ATTEMPT: Get all pending invitations and do client-side matching
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
      
      // Manual case-insensitive matching against all invitations
      const matchingInvitation = allInvitations?.find(inv => {
        // Clean invitation token for consistent comparison
        const cleanToken = inv.invitation_token.trim().toUpperCase();
        return cleanToken === cleanCode;
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
      
      // No match found
      console.log("[InvitationMatchingService] No match found for code:", cleanCode);
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
