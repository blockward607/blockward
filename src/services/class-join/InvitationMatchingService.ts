
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
      // Extract the code from input string (could be URL, pasted text, etc.)
      const cleanCode = this.extractCodeFromInput(code);
      if (!cleanCode) {
        return { 
          data: null, 
          error: { message: "Invalid code format. Please try again." } 
        };
      }
      
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
    } catch (error: any) {
      console.error("[InvitationMatchingService] Unexpected error:", error);
      return { 
        data: null, 
        error: { message: error.message || "Failed to process invitation code" } 
      };
    }
  },
  
  // Helper method to extract a code from different input formats
  extractCodeFromInput(input: string): string | null {
    if (!input) return null;
    
    input = input.trim();
    console.log("[InvitationMatchingService] Extracting code from input:", input);
    
    // Handle direct classroom UUID in URL
    // This pattern matches the entire URL containing a UUID
    const uuidInUrlPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const uuidMatch = input.match(uuidInUrlPattern);
    if (uuidMatch && uuidMatch[1]) {
      console.log("[InvitationMatchingService] Extracted UUID from URL:", uuidMatch[1]);
      return uuidMatch[1];
    }
    
    // Case 1: URL with join parameter
    const joinParamRegex = /[?&]join=([^&]+)/i;
    const joinMatch = input.match(joinParamRegex);
    if (joinMatch && joinMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from join parameter:", joinMatch[1]);
      return joinMatch[1].toUpperCase();
    }
    
    // Case A: Handle Netlify or other deployment URLs with the invitation code
    // This matches URLs that might contain the code after the netlify.app/ part
    const deployUrlRegex = /\/([A-Z0-9]{6,10})(?:\/|$|\?)/i;
    const deployUrlMatch = input.match(deployUrlRegex);
    if (deployUrlMatch && deployUrlMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from deployment URL:", deployUrlMatch[1]);
      return deployUrlMatch[1].toUpperCase();
    }
    
    // Case 2: URL with code parameter
    const codeParamRegex = /[?&]code=([^&]+)/i;
    const codeMatch = input.match(codeParamRegex);
    if (codeMatch && codeMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from code parameter:", codeMatch[1]);
      return codeMatch[1].toUpperCase();
    }
    
    // Case 3: URL with join path (e.g., /join/CODE)
    const joinPathRegex = /\/join\/([A-Za-z0-9]+)/i;
    const joinPathMatch = input.match(joinPathRegex);
    if (joinPathMatch && joinPathMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from join path:", joinPathMatch[1]);
      return joinPathMatch[1].toUpperCase();
    }
    
    // Case 4: Direct code (no URL)
    // Check if input is likely a direct 6-character code (common format for invitation codes)
    const directCodePattern = /^[A-Z0-9]{6,10}$/i;
    if (directCodePattern.test(input)) {
      console.log("[InvitationMatchingService] Input appears to be a direct invitation code");
      return input.toUpperCase();
    }
    
    // Case 5: Last resort - try to extract any alphanumeric sequence that looks like a code
    const codePattern = /([A-Z0-9]{6,10})/i;
    const codePatternMatch = input.match(codePattern);
    if (codePatternMatch && codePatternMatch[1]) {
      console.log("[InvitationMatchingService] Extracted possible code pattern:", codePatternMatch[1]);
      return codePatternMatch[1].toUpperCase();
    }
    
    // Final fallback: Clean and standardize input - remove spaces, convert to uppercase
    const cleanCode = input.replace(/\s+/g, '').toUpperCase();
    console.log("[InvitationMatchingService] Using cleaned input as code:", cleanCode);
    return cleanCode;
  }
};
