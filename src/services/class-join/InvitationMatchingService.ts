
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
    console.log("Trying to find classroom or invitation with code:", code);
    try {
      // Clean up the code - remove spaces and convert to uppercase for consistency
      const cleanCode = code.trim().toUpperCase();
      
      console.log("DEBUG - Clean code value:", cleanCode);
      
      // 1. First try to find a direct class invitation by token (exact match)
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
        
        // Get classroom details in a separate query to avoid circular references
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', invitation.classroom_id)
          .maybeSingle();
        
        console.log("Found classroom for invitation:", classroom);
        
        // Create a simple object with only the necessary properties to avoid type instantiation issues
        const classroomData = classroom ? {
          id: classroom.id,
          name: classroom.name
        } : undefined;
        
        return { 
          data: { 
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: classroomData
          }, 
          error: null 
        };
      }
      
      // 2. Try to find the classroom directly by ID (if code is a UUID)
      if (cleanCode.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
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
      
      // 3. Try an alternative query with more debugging
      console.log("Trying alternative query for code:", cleanCode);
      const { data: allInvitations, error: queryError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending');
        
      if (queryError) {
        console.error("Error querying invitations:", queryError);
      } else {
        console.log("All pending invitations:", allInvitations);
        // Find any matching invitation manually for debugging
        const matchingInv = allInvitations?.find(inv => 
          inv.invitation_token.trim().toUpperCase() === cleanCode
        );
        
        if (matchingInv) {
          console.log("Found matching invitation manually:", matchingInv);
          
          // Get classroom details
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', matchingInv.classroom_id)
            .maybeSingle();
            
          return { 
            data: { 
              classroomId: matchingInv.classroom_id,
              invitationId: matchingInv.id,
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
      
      // 4. Log what code we're looking for to help debug
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
