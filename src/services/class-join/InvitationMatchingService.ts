
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

interface InvitationResult {
  id: string;
  classroom_id: string;
  invitation_token: string;
  status: string;
  expires_at: string;
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
      
      // MOST PERMISSIVE MATCH FIRST - Try with any potential code match
      const { data: invitations, error: inviteError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending');
      
      if (inviteError) {
        console.error("[InvitationMatchingService] Error fetching invitations:", inviteError);
      }
      
      if (invitations && invitations.length > 0) {
        console.log("[InvitationMatchingService] Examining", invitations.length, "potential invitations");
        
        // Check for exact match first (case-insensitive)
        const exactMatchInvitation = invitations.find(inv => 
          inv.invitation_token.toUpperCase() === cleanCode.toUpperCase()
        );
        
        if (exactMatchInvitation) {
          console.log("[InvitationMatchingService] Found exact match (case-insensitive):", exactMatchInvitation);
          
          // Get classroom details
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', exactMatchInvitation.classroom_id)
            .maybeSingle();
            
          return { 
            data: { 
              classroomId: exactMatchInvitation.classroom_id,
              invitationId: exactMatchInvitation.id,
              classroom: classroom || undefined
            }, 
            error: null 
          };
        }
        
        // Check for partial matches (code is contained within token)
        const partialMatches = invitations.filter(inv => 
          inv.invitation_token.toUpperCase().includes(cleanCode.toUpperCase()) ||
          cleanCode.toUpperCase().includes(inv.invitation_token.toUpperCase())
        );
        
        if (partialMatches.length > 0) {
          // Sort by closest length match
          const bestMatch = partialMatches.sort((a, b) => 
            Math.abs(a.invitation_token.length - cleanCode.length) - 
            Math.abs(b.invitation_token.length - cleanCode.length)
          )[0];
          
          console.log("[InvitationMatchingService] Found partial match:", bestMatch);
          
          // Get classroom details
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', bestMatch.classroom_id)
            .maybeSingle();
            
          return { 
            data: { 
              classroomId: bestMatch.classroom_id,
              invitationId: bestMatch.id,
              classroom: classroom || undefined
            }, 
            error: null 
          };
        }
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
      
      // DIRECT DATABASE LOOKUP with explicit filter combinations
      try {
        const { data: dbResults, error: dbError } = await supabase
          .from('class_invitations')
          .select('id, classroom_id, invitation_token, status, expires_at')
          .eq('status', 'pending')
          .filter('expires_at', 'gte', 'now()');
          
        if (!dbError && dbResults && dbResults.length > 0) {
          console.log("[InvitationMatchingService] Checking", dbResults.length, "valid invitations for potential matches");
          
          // Find potential matches with different matching strategies
          const matchedInvitations = dbResults.filter(inv => {
            const invCode = inv.invitation_token.toUpperCase();
            const inputCode = cleanCode.toUpperCase();
            
            return invCode === inputCode || // Exact match
                   invCode.includes(inputCode) || // Token contains input
                   inputCode.includes(invCode) || // Input contains token
                   this.calculateSimilarity(invCode, inputCode) > 0.7; // Over 70% similar
          });
          
          if (matchedInvitations.length > 0) {
            // Sort to find the most relevant match
            const sortedResults = matchedInvitations.sort((a, b) => {
              const aSimilarity = this.calculateSimilarity(a.invitation_token.toUpperCase(), cleanCode.toUpperCase());
              const bSimilarity = this.calculateSimilarity(b.invitation_token.toUpperCase(), cleanCode.toUpperCase());
              
              // Higher similarity wins
              return bSimilarity - aSimilarity;
            });
            
            const bestMatch = sortedResults[0] as InvitationResult;
            console.log("[InvitationMatchingService] Found best match invitation:", bestMatch, 
                        "with similarity:", this.calculateSimilarity(bestMatch.invitation_token.toUpperCase(), cleanCode.toUpperCase()));
            
            // Get classroom details
            const { data: classroom } = await supabase
              .from('classrooms')
              .select('id, name')
              .eq('id', bestMatch.classroom_id)
              .maybeSingle();
              
            return { 
              data: { 
                classroomId: bestMatch.classroom_id,
                invitationId: bestMatch.id,
                classroom: classroom || undefined
              }, 
              error: null 
            };
          }
        }
      } catch (dbQueryError) {
        console.error("[InvitationMatchingService] Direct query error:", dbQueryError);
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
  
  // Helper method to calculate string similarity (Levenshtein distance based)
  private static calculateSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0; // Identical strings
    
    const len1 = s1.length;
    const len2 = s2.length;
    
    if (len1 === 0 || len2 === 0) return 0.0;
    
    // Simple similarity for short strings - check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
      return Math.min(len1, len2) / Math.max(len1, len2);
    }
    
    // For very different length strings, similarity is low
    if (Math.max(len1, len2) > 2 * Math.min(len1, len2)) {
      return 0.1;
    }
    
    // Count matching characters (position-independent)
    let matches = 0;
    const s1Chars = new Set(s1.split(''));
    const s2Chars = new Set(s2.split(''));
    
    for (const char of s1Chars) {
      if (s2Chars.has(char)) matches++;
    }
    
    return matches / Math.max(s1Chars.size, s2Chars.size);
  }
  
  // Helper method to extract a code from different input formats
  static extractCodeFromInput(input: string): string | null {
    if (!input) return null;
    
    input = input.trim();
    console.log("[InvitationMatchingService] Extracting code from input:", input);
    
    // Handle full URLs with code at the end (most common case first)
    if (input.includes('blockward') && input.includes('code=')) {
      const codeMatch = input.match(/code=([^&]+)/i);
      if (codeMatch && codeMatch[1]) {
        console.log("[InvitationMatchingService] Extracted code from URL parameter:", codeMatch[1]);
        return codeMatch[1].toUpperCase();
      }
    }
    
    // Direct UK code form (our format)
    const ukCodePattern = /UK[A-Z0-9]{4,6}/i;
    const ukMatch = input.match(ukCodePattern);
    if (ukMatch && ukMatch[0]) {
      console.log("[InvitationMatchingService] Found UK-format code:", ukMatch[0]);
      return ukMatch[0].toUpperCase();
    }
    
    // Handle UUID in URL
    const uuidInUrlPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const uuidMatch = input.match(uuidInUrlPattern);
    if (uuidMatch && uuidMatch[1]) {
      console.log("[InvitationMatchingService] Extracted UUID from URL:", uuidMatch[1]);
      return uuidMatch[1];
    }
    
    // Case: URL with code parameter
    const codeParamRegex = /[?&]code=([^&]+)/i;
    const codeMatch = input.match(codeParamRegex);
    if (codeMatch && codeMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from parameter:", codeMatch[1]);
      return codeMatch[1].toUpperCase();
    }
    
    // Case: URL with join parameter
    const joinParamRegex = /[?&]join=([^&]+)/i;
    const joinMatch = input.match(joinParamRegex);
    if (joinMatch && joinMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from join parameter:", joinMatch[1]);
      return joinMatch[1].toUpperCase();
    }
    
    // Case: Direct code form (alphanumeric)
    const directCodePattern = /^[A-Z0-9]{4,10}$/i;
    if (directCodePattern.test(input)) {
      console.log("[InvitationMatchingService] Input appears to be a direct invitation code");
      return input.toUpperCase();
    }
    
    // Case: URL with code in path segment (e.g., /join/CODE)
    const joinPathRegex = /\/join\/([A-Za-z0-9]+)/i;
    const joinPathMatch = input.match(joinPathRegex);
    if (joinPathMatch && joinPathMatch[1]) {
      console.log("[InvitationMatchingService] Extracted code from join path:", joinPathMatch[1]);
      return joinPathMatch[1].toUpperCase();
    }
    
    // Final fallback: Clean and standardize input - remove spaces, convert to uppercase
    if (input.length >= 4 && input.length <= 20) {
      const cleanCode = input.replace(/\s+/g, '').toUpperCase();
      console.log("[InvitationMatchingService] Using cleaned input as code:", cleanCode);
      return cleanCode;
    }
    
    return input.toUpperCase(); // Last resort, just return the uppercase input
  }
}
