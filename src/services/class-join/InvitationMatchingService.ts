
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
      // Clean input
      const cleanCode = code.trim().toUpperCase();
      
      if (!cleanCode) {
        return { 
          data: null, 
          error: { message: "Please provide a valid code." } 
        };
      }
      
      // 1. First try to find a direct class invitation by token
      const { data: invitation, error: invitationError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('invitation_token', cleanCode)
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
      
      // 2. Try looking up by partial invitation token
      if (cleanCode.length >= 3) {
        const { data: invitationsByPartial } = await supabase
          .from('class_invitations')
          .select('id, classroom_id, invitation_token, status, expires_at')
          .like('invitation_token', `${cleanCode}%`)
          .eq('status', 'pending')
          .limit(1);
          
        if (invitationsByPartial && invitationsByPartial.length > 0) {
          const matchedInvitation = invitationsByPartial[0];
          
          // Check if invitation is expired
          if (matchedInvitation.expires_at && new Date(matchedInvitation.expires_at) < new Date()) {
            return { 
              data: null, 
              error: { message: "This invitation has expired. Please request a new one." } 
            };
          }
          
          // Get classroom details
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', matchedInvitation.classroom_id)
            .maybeSingle();
            
          return { 
            data: { 
              classroomId: matchedInvitation.classroom_id,
              invitationId: matchedInvitation.id,
              classroom: classroom ? {
                id: classroom.id,
                name: classroom.name
              } : undefined
            }, 
            error: null 
          };
        }
      }
      
      // 3. Try to find the classroom directly by ID (if code is a UUID)
      // This can happen when scanning QR codes or using direct links
      if (cleanCode.length > 8 && cleanCode.includes('-')) {
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', cleanCode)
          .maybeSingle();
          
        console.log("Classroom lookup result:", { classroom, classroomError });
          
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
      
      // 4. Try classroom name match (if the code might be a name)
      if (cleanCode.length > 2) {
        const { data: classroomsByName } = await supabase
          .from('classrooms')
          .select('id, name')
          .ilike('name', `%${cleanCode}%`)
          .limit(1);
          
        if (classroomsByName && classroomsByName.length > 0) {
          const classroom = classroomsByName[0];
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
      
      // 5. If nothing found, return null data
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
