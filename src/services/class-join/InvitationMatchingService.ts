
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
      console.error("[InvitationMatchingService] Invalid input:", code);
      return {
        data: null,
        error: { message: "Please provide a valid invitation code" }
      };
    }
    
    try {
      // Extract the code from input string (could be URL, pasted text, etc.)
      const cleanCode = this.extractCodeFromInput(code);
      if (!cleanCode) {
        console.error("[InvitationMatchingService] Could not extract code from:", code);
        return { 
          data: null, 
          error: { message: "Could not recognize a valid code format. Please try again." } 
        };
      }
      
      console.log("[InvitationMatchingService] Looking for code:", cleanCode);
      
      // Try direct database function first (most efficient)
      const { data: dbMatchResult, error: dbError } = await supabase
        .rpc('find_invitation_by_code', { code_param: cleanCode });
        
      if (dbError) {
        console.error("[InvitationMatchingService] DB function error:", dbError);
      } else if (dbMatchResult && dbMatchResult.length > 0) {
        console.log("[InvitationMatchingService] Found match from DB function:", dbMatchResult[0]);
        const matchedInvite = dbMatchResult[0];
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', matchedInvite.classroom_id)
          .maybeSingle();
          
        return { 
          data: { 
            classroomId: matchedInvite.classroom_id,
            invitationId: matchedInvite.id,
            classroom: classroom || undefined
          }, 
          error: null 
        };
      }
      
      // Try exact match next
      const exactMatch = await InvitationMatchingService.findExactMatch(cleanCode);
      if (exactMatch.data) {
        console.log("[InvitationMatchingService] Found exact match:", exactMatch.data);
        return exactMatch;
      }
      
      // Try fuzzy matching if no exact match
      const fuzzyMatch = await InvitationMatchingService.findFuzzyMatch(cleanCode);
      if (fuzzyMatch.data) {
        console.log("[InvitationMatchingService] Found fuzzy match:", fuzzyMatch.data);
        return fuzzyMatch;
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
  
  // Find exact match for invitation code
  static async findExactMatch(code: string): Promise<JoinClassResult> {
    try {
      console.log("[InvitationMatchingService] Trying exact match for:", code);
      // Try exact match (case insensitive)
      const { data: invitations, error } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token')
        .eq('status', 'pending')
        .filter('expires_at', 'gte', 'now()');
        
      if (error) throw error;
      
      if (invitations && invitations.length > 0) {
        const exactMatch = invitations.find(inv => 
          inv.invitation_token.toUpperCase() === code.toUpperCase()
        );
        
        if (exactMatch) {
          console.log("[InvitationMatchingService] Exact match found:", exactMatch);
          // Get classroom details
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', exactMatch.classroom_id)
            .maybeSingle();
            
          return { 
            data: { 
              classroomId: exactMatch.classroom_id,
              invitationId: exactMatch.id,
              classroom: classroom || undefined
            }, 
            error: null 
          };
        }
      }
      
      // Try UUID match (if the code looks like a UUID)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(code)) {
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', code)
          .maybeSingle();
          
        if (classroom) {
          return { 
            data: { 
              classroomId: classroom.id,
              invitationId: null,
              classroom
            }, 
            error: null 
          };
        }
      }
      
      return { data: null, error: null };
    } catch (error: any) {
      console.error("[InvitationMatchingService] Error in exact match:", error);
      return { 
        data: null, 
        error: { message: error.message || "Error processing invitation code" } 
      };
    }
  }
  
  // Find fuzzy match for invitation code
  static async findFuzzyMatch(code: string): Promise<JoinClassResult> {
    try {
      console.log("[InvitationMatchingService] Trying fuzzy match for:", code);
      // Get all valid invitations
      const { data: invitations, error } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token')
        .eq('status', 'pending')
        .filter('expires_at', 'gte', 'now()');
        
      if (error) throw error;
      
      if (!invitations || invitations.length === 0) {
        return { data: null, error: null };
      }
      
      // Try partial matches
      const partialMatches = invitations.filter(inv => {
        const invCode = inv.invitation_token.toUpperCase();
        const inputCode = code.toUpperCase();
        
        // Different matching strategies
        return (
          invCode.includes(inputCode) || // Token contains input
          inputCode.includes(invCode) || // Input contains token
          InvitationMatchingService.calculateSimilarity(invCode, inputCode) > 0.7 // Over 70% similar
        );
      });
      
      if (partialMatches.length > 0) {
        console.log("[InvitationMatchingService] Found partial matches:", partialMatches.length);
        // Sort by similarity
        const sortedMatches = partialMatches.sort((a, b) => {
          const aSimilarity = InvitationMatchingService.calculateSimilarity(
            a.invitation_token.toUpperCase(), 
            code.toUpperCase()
          );
          const bSimilarity = InvitationMatchingService.calculateSimilarity(
            b.invitation_token.toUpperCase(), 
            code.toUpperCase()
          );
          return bSimilarity - aSimilarity;
        });
        
        const bestMatch = sortedMatches[0];
        
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
      
      return { data: null, error: null };
    } catch (error: any) {
      console.error("[InvitationMatchingService] Error in fuzzy match:", error);
      return { 
        data: null, 
        error: { message: error.message || "Error processing invitation code" } 
      };
    }
  }
  
  // Calculate similarity between two strings (0-1)
  static calculateSimilarity(s1: string, s2: string): number {
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
  
  // Extract code from various input formats
  static extractCodeFromInput(input: string): string | null {
    if (!input) return null;
    
    input = input.trim();
    console.log("[InvitationMatchingService] Extracting code from input:", input);
    
    // Handle full URLs with code parameter
    if (input.includes('code=')) {
      const codeMatch = input.match(/code=([^&]+)/i);
      if (codeMatch && codeMatch[1]) {
        return codeMatch[1].toUpperCase();
      }
    }
    
    // Check for UK-format code pattern
    const ukCodePattern = /UK[A-Z0-9]{4,6}/i;
    const ukMatch = input.match(ukCodePattern);
    if (ukMatch && ukMatch[0]) {
      return ukMatch[0].toUpperCase();
    }
    
    // Handle UUID in URL
    const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const uuidMatch = input.match(uuidPattern);
    if (uuidMatch && uuidMatch[1]) {
      return uuidMatch[1];
    }
    
    // Check for join parameter
    const joinParamRegex = /[?&]join=([^&]+)/i;
    const joinMatch = input.match(joinParamRegex);
    if (joinMatch && joinMatch[1]) {
      return joinMatch[1].toUpperCase();
    }
    
    // Direct code form (alphanumeric)
    const directCodePattern = /^[A-Z0-9]{4,10}$/i;
    if (directCodePattern.test(input)) {
      return input.toUpperCase();
    }
    
    // URL with code in path segment
    const joinPathRegex = /\/join\/([A-Za-z0-9]+)/i;
    const joinPathMatch = input.match(joinPathRegex);
    if (joinPathMatch && joinPathMatch[1]) {
      return joinPathMatch[1].toUpperCase();
    }
    
    // Fallback: Clean and return uppercase
    if (input.length >= 4 && input.length <= 20) {
      return input.replace(/\s+/g, '').toUpperCase();
    }
    
    return input.toUpperCase();
  }
}
