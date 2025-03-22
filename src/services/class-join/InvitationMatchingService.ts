
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

export class InvitationMatchingService {
  // Try to find a classroom or invitation with the given code
  static async findClassroomOrInvitation(code: string): Promise<JoinClassResult> {
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
      
      // DIRECT EXACT MATCH - First approach with highest priority
      const { data: exactInvitation, error: exactError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending')
        .eq('invitation_token', cleanCode)
        .maybeSingle();
      
      if (!exactError && exactInvitation) {
        console.log("[InvitationMatchingService] Found exact match invitation:", exactInvitation);
        
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
            classroom: classroom || undefined
          }, 
          error: null 
        };
      }
      
      // CASE INSENSITIVE MATCH - Second approach
      const { data: caseInsensitiveInvitation, error: caseError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending')
        .ilike('invitation_token', cleanCode)
        .maybeSingle();
        
      if (!caseError && caseInsensitiveInvitation) {
        console.log("[InvitationMatchingService] Found case-insensitive match:", caseInsensitiveInvitation);
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', caseInsensitiveInvitation.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: caseInsensitiveInvitation.classroom_id,
            invitationId: caseInsensitiveInvitation.id,
            classroom: classroom || undefined
          }, 
          error: null 
        };
      }
      
      // FUZZY MATCH - Try with wildcard matching (in case code has some extra characters)
      const { data: fuzzyInvitations, error: fuzzyError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending')
        .ilike('invitation_token', `%${cleanCode}%`)
        .limit(5);
      
      if (!fuzzyError && fuzzyInvitations && fuzzyInvitations.length > 0) {
        // Find the closest match (shortest invitation_token)
        const closestMatch = fuzzyInvitations.sort((a, b) => 
          a.invitation_token.length - b.invitation_token.length
        )[0];
        
        console.log("[InvitationMatchingService] Found fuzzy match:", closestMatch);
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', closestMatch.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: closestMatch.classroom_id,
            invitationId: closestMatch.id,
            classroom: classroom || undefined
          }, 
          error: null 
        };
      }
      
      // UUID MATCH - Check if the code is a classroom UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(cleanCode)) {
        console.log("[InvitationMatchingService] Code looks like a UUID, checking for classroom match");
        
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', cleanCode)
          .maybeSingle();
          
        if (!classroomError && classroom) {
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
      
      // DIRECT DATABASE LOOKUP - Use the function we created
      try {
        const { data: functionResult, error: functionError } = await supabase.rpc(
          'find_invitation_by_code',
          { code_param: cleanCode }
        );
        
        if (!functionError && functionResult && functionResult.length > 0) {
          const invitation = functionResult[0];
          console.log("[InvitationMatchingService] Found invitation via function:", invitation);
          
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
      } catch (functionCallError) {
        console.log("[InvitationMatchingService] Function call error:", functionCallError);
        // Continue to next approach if function call fails
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
  }
  
  // Helper method to extract a code from different input formats
  static extractCodeFromInput(input: string): string | null {
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
    
    // Case 1: URL with code parameter (highest priority)
    const codeParamRegex = /[?&]code=([^&]+)/i;
    const codeMatch = input.match(codeParamRegex);
    if (codeMatch && codeMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from code parameter:", codeMatch[1]);
      return codeMatch[1].toUpperCase();
    }
    
    // Case 2: URL with join parameter
    const joinParamRegex = /[?&]join=([^&]+)/i;
    const joinMatch = input.match(joinParamRegex);
    if (joinMatch && joinMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from join parameter:", joinMatch[1]);
      return joinMatch[1].toUpperCase();
    }
    
    // Case 3: Direct code form
    // Check if input is an alphanumeric code (common format for invitation codes)
    const directCodePattern = /^[A-Z0-9]{6,10}$/i;
    if (directCodePattern.test(input)) {
      console.log("[InvitationMatchingService] Input appears to be a direct invitation code");
      return input.toUpperCase();
    }
    
    // Case 4: URL with code in path segment (e.g., /join/CODE)
    const joinPathRegex = /\/join\/([A-Za-z0-9]+)/i;
    const joinPathMatch = input.match(joinPathRegex);
    if (joinPathMatch && joinPathMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from join path:", joinPathMatch[1]);
      return joinPathMatch[1].toUpperCase();
    }
    
    // Case 5: Extract code from URL path as last resort
    // This matches URLs like blockward.me/classes?code=UK7BAA or similar patterns
    const codeInPathRegex = /[/=](UK[A-Z0-9]{4,8})/i;
    const codeInPathMatch = input.match(codeInPathRegex);
    if (codeInPathMatch && codeInPathMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code pattern from URL:", codeInPathMatch[1]);
      return codeInPathMatch[1].toUpperCase();
    }
    
    // Case 6: Last resort - try to extract any alphanumeric sequence that looks like a code
    const codePattern = /([A-Z0-9]{6,10})/i;
    const codePatternMatch = input.match(codePattern);
    if (codePatternMatch && codePatternMatch[1]) {
      console.log("[InvitationMatchingService] Extracted possible code pattern:", codePatternMatch[1]);
      return codePatternMatch[1].toUpperCase();
    }
    
    // Final fallback: Clean and standardize input - remove spaces, convert to uppercase
    if (input.length >= 4 && input.length <= 20) {
      const cleanCode = input.replace(/\s+/g, '').toUpperCase();
      console.log("[InvitationMatchingService] Using cleaned input as code:", cleanCode);
      return cleanCode;
    }
    
    return null;
  }
}
