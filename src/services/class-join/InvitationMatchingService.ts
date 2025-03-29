
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "./types";
import { codeExtractor } from "@/utils/codeExtractor";

export class InvitationMatchingService {
  // Extract code from various input formats (URL, plain code, etc.)
  public static extractCodeFromInput(input: string): string | null {
    return codeExtractor.extractJoinCode(input);
  }

  // Find classroom or invitation by code - our comprehensive method
  public static async findClassroomOrInvitation(code: string): Promise<{ data: JoinClassroomResult | null; error: { message: string } | null }> {
    try {
      console.log("[InvitationMatchingService] Finding classroom or invitation for code:", code);
      
      if (!code) {
        return { 
          data: null, 
          error: { message: "No invitation code provided" } 
        };
      }

      // Process code to handle various formats
      const processedCode = this.extractCodeFromInput(code);
      if (!processedCode) {
        return { 
          data: null, 
          error: { message: "Invalid code format" } 
        };
      }
      
      console.log("[InvitationMatchingService] Processed code:", processedCode);

      // IMPORTANT: First try to find a match on the exact invitation token
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, expires_at, status, classroom:classrooms(id, name, description, teacher_id)')
        .eq('invitation_token', processedCode)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (inviteError && !inviteError.message.includes('No rows found')) {
        console.error("[InvitationMatchingService] Error checking invitation:", inviteError);
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
        
        console.log("[InvitationMatchingService] Found matching invitation:", invitation);
        
        return { 
          data: {
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: invitation.classroom
          }, 
          error: null 
        };
      }
      
      // If no invitation found, try to find classroom by ID (legacy support)
      // This can happen if a teacher shares a direct classroom ID
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, name, description, teacher_id')
        .eq('id', processedCode)
        .maybeSingle();
        
      if (classroomError && !classroomError.message.includes('No rows found')) {
        console.error("[InvitationMatchingService] Error checking classroom:", classroomError);
        return { 
          data: null, 
          error: { message: "Error checking classroom" } 
        };
      }
      
      if (classroom) {
        console.log("[InvitationMatchingService] Found matching classroom by ID:", classroom);
        return { 
          data: {
            classroomId: classroom.id,
            classroom: classroom
          }, 
          error: null 
        };
      }
      
      // Try broader search for invitation codes containing the provided code
      // This helps with partial code matches and case insensitivity
      if (/^UK[A-Z0-9]{4,6}$/i.test(processedCode)) {
        console.log("[InvitationMatchingService] Looking for UK-format invitation with ilike");
        
        // Look for invitation codes using ilike for partial matching
        const { data: ukInvitations, error: ukError } = await supabase
          .from('class_invitations')
          .select('id, classroom_id, expires_at, status, invitation_token, classroom:classrooms(id, name, description, teacher_id)')
          .ilike('invitation_token', processedCode) 
          .eq('status', 'pending')
          .limit(1);
          
        if (ukError) {
          console.error("[InvitationMatchingService] Error with ilike search:", ukError);
          return { 
            data: null, 
            error: { message: "Error checking invitation" } 
          };
        }
        
        if (ukInvitations && ukInvitations.length > 0) {
          const invitation = ukInvitations[0];
          console.log("[InvitationMatchingService] Found invitation with ilike:", invitation);
          
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
        
        // Try exact match but case-insensitive
        console.log("[InvitationMatchingService] Trying case-insensitive exact match");
        const { data: caseInsensitiveInvitations, error: ciError } = await supabase
          .from('class_invitations')
          .select('id, classroom_id, expires_at, status, invitation_token, classroom:classrooms(id, name, description, teacher_id)')
          .filter('invitation_token', 'ilike', processedCode)
          .eq('status', 'pending')
          .limit(1);
          
        if (ciError) {
          console.error("[InvitationMatchingService] Error with case-insensitive search:", ciError);
        } else if (caseInsensitiveInvitations && caseInsensitiveInvitations.length > 0) {
          const invitation = caseInsensitiveInvitations[0];
          console.log("[InvitationMatchingService] Found invitation with case-insensitive match:", invitation);
          
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
      }
      
      console.log("[InvitationMatchingService] No matching invitation or classroom found for:", processedCode);
      
      // No valid matches found
      return { 
        data: null, 
        error: { message: "Invalid or expired invitation code" } 
      };
    } catch (err: any) {
      console.error("[InvitationMatchingService] Error in findClassroomOrInvitation:", err);
      return { 
        data: null, 
        error: { message: err.message || "Something went wrong. Please try again." } 
      };
    }
  }
}
