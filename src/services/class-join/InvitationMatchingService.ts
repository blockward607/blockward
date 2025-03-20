
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
    
    console.log("Trying to find classroom or invitation with code:", code);
    try {
      // Clean up the code - remove spaces and standardize case for consistency
      const cleanCode = code.trim().toUpperCase();
      
      console.log("Cleaned code value:", cleanCode);
      
      // 1. First try to find a direct class invitation by token
      console.log("Trying to find invitation with token:", cleanCode);
      const { data: invitation, error: invitationError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .ilike('invitation_token', cleanCode) // Using case-insensitive comparison
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
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', invitation.classroom_id)
          .maybeSingle();
        
        console.log("Found classroom for invitation:", classroom);
        
        return { 
          data: { 
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: classroom ? {
              id: classroom.id,
              name: classroom.name
            } : undefined
          }, 
          error: null 
        };
      }
      
      // 2. Try to find the classroom directly by ID (if code is a UUID)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(cleanCode)) {
        console.log("Code appears to be a UUID, checking for direct classroom match");
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', cleanCode)
          .maybeSingle();
          
        console.log("Classroom lookup by UUID result:", { classroom, classroomError });
          
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
      
      // 3. Try an alternative query for debugging purposes
      console.log("Trying alternative query to find all pending invitations");
      const { data: allInvitations, error: queryError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending');
        
      if (queryError) {
        console.error("Error querying all invitations:", queryError);
      } else {
        console.log("All pending invitations:", allInvitations);
        
        // Try to find a matching invitation manually (case-insensitive)
        const matchingInvitation = allInvitations?.find(inv => 
          inv.invitation_token.trim().toUpperCase() === cleanCode
        );
        
        if (matchingInvitation) {
          console.log("Found matching invitation manually:", matchingInvitation);
          
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
        } else {
          console.log("No matching invitation found manually");
        }
      }
      
      // 4. If we got here, no valid invitation or classroom was found
      console.log("No valid invitation or classroom found with code:", cleanCode);
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
