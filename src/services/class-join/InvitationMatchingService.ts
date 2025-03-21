
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
  // Try to find a classroom or invitation with the given code
  async findClassroomOrInvitation(code: string): Promise<JoinClassResult> {
    // Validate input
    if (!code || typeof code !== 'string') {
      return {
        data: null,
        error: { message: "Please provide a valid invitation code" }
      };
    }
    
    try {
      // Clean up the code - standardize case and remove spaces
      const cleanCode = code.trim().toUpperCase();
      
      // Check if input is a full URL
      if (cleanCode.includes('?CODE=')) {
        // Extract the code from URL param
        const urlParts = cleanCode.split('?CODE=');
        if (urlParts.length > 1) {
          const extractedCode = urlParts[1].split('&')[0]; // Get code param and remove any following params
          console.log("[InvitationMatchingService] Extracted code from URL:", extractedCode);
          return this.processCode(extractedCode);
        }
      }
      
      // Check if input is a full URL with lowercase param
      if (cleanCode.includes('?CODE=') || cleanCode.includes('?code=')) {
        // Extract the code from URL param, case insensitive
        const codeParam = cleanCode.match(/[?&]code=([^&]+)/i);
        if (codeParam && codeParam[1]) {
          console.log("[InvitationMatchingService] Extracted code from URL param:", codeParam[1]);
          return this.processCode(codeParam[1]);
        }
      }
      
      // If not a URL, process as a direct code
      console.log("[InvitationMatchingService] Processing as direct code:", cleanCode);
      return this.processCode(cleanCode);
    } catch (error: any) {
      console.error("[InvitationMatchingService] Unexpected error:", error);
      return { 
        data: null, 
        error: { message: error.message || "Failed to process invitation code" } 
      };
    }
  },
  
  // Process the clean code to find matching invitation or classroom
  async processCode(cleanCode: string): Promise<JoinClassResult> {
    console.log("[InvitationMatchingService] Looking for code:", cleanCode);
    
    // First try: Direct match with invitation_token
    const { data: invitation, error: invitationError } = await supabase
      .from('class_invitations')
      .select('id, classroom_id, invitation_token, status, expires_at')
      .eq('status', 'pending')
      .ilike('invitation_token', cleanCode)
      .maybeSingle();
    
    if (invitationError) {
      console.error("[InvitationMatchingService] Error looking for invitation:", invitationError);
    }
    
    // Check if we found an invitation
    if (invitation) {
      console.log("[InvitationMatchingService] Found matching invitation:", invitation);
      
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
        
      return { 
        data: { 
          classroomId: invitation.classroom_id,
          invitationId: invitation.id,
          classroom: classroom || undefined
        }, 
        error: null 
      };
    }
    
    // Second try: Check if the code is a classroom UUID
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(cleanCode)) {
      console.log("[InvitationMatchingService] Code looks like a UUID, checking for classroom match");
      
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('id', cleanCode)
        .maybeSingle();
        
      if (classroomError) {
        console.error("[InvitationMatchingService] Error looking for classroom:", classroomError);
      }
      
      if (classroom) {
        console.log("[InvitationMatchingService] Found classroom with ID:", classroom.id);
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
    
    // No match found
    console.log("[InvitationMatchingService] No match found for code:", cleanCode);
    return { 
      data: null, 
      error: { message: "Invalid invitation link or code. Please check and try again." } 
    };
  }
};
