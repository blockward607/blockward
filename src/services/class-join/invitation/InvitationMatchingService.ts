
import { JoinClassroomResult } from "../types";
import { extractInvitationCode } from "./extractCode";
import { findExactInvitationMatch } from "./findExactMatch";
import { findClassroomById } from "./findClassroomById";
import { findPartialInvitationMatch } from "./findPartialMatch";
import { findCaseInsensitiveMatch } from "./findCaseInsensitiveMatch";

export class InvitationMatchingService {
  /**
   * Extract code from various input formats (URL, plain code, etc.)
   */
  public static extractCodeFromInput(input: string): string | null {
    const extractedCode = extractInvitationCode(input);
    console.log("[InvitationMatchingService] Input:", input, "Extracted code:", extractedCode);
    return extractedCode;
  }

  /**
   * Find classroom or invitation by code - our comprehensive method that tries multiple matching strategies
   */
  public static async findClassroomOrInvitation(code: string): Promise<{ 
    data: JoinClassroomResult | null; 
    error: { message: string } | null 
  }> {
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

      // Direct database check - most reliable way to verify if code exists
      // This will find both exact and close matches through the database function
      const { data: directDBMatch, error: dbError } = await findDirectDatabaseMatch(processedCode);
      if (dbError) {
        console.error("[InvitationMatchingService] Database lookup error:", dbError);
      } else if (directDBMatch && directDBMatch.data) {
        console.log("[InvitationMatchingService] Found direct database match:", directDBMatch.data);
        return directDBMatch;
      }

      // Strategy 1: Try exact invitation token match
      const exactMatch = await findExactInvitationMatch(processedCode);
      if (exactMatch.data) {
        console.log("[InvitationMatchingService] Found exact match:", exactMatch.data);
        return exactMatch;
      }
      
      // Strategy 2: Try classroom ID match (legacy support)
      const classroomMatch = await findClassroomById(processedCode);
      if (classroomMatch.data) {
        console.log("[InvitationMatchingService] Found classroom match:", classroomMatch.data);
        return classroomMatch;
      }
      
      // Strategy 3: Try broader partial match for UK-format codes
      const partialMatch = await findPartialInvitationMatch(processedCode);
      if (partialMatch.data) {
        console.log("[InvitationMatchingService] Found partial match:", partialMatch.data);
        return partialMatch;
      }
      
      // Strategy 4: Try case-insensitive exact match
      const caseInsensitiveMatch = await findCaseInsensitiveMatch(processedCode);
      if (caseInsensitiveMatch.data) {
        console.log("[InvitationMatchingService] Found case-insensitive match:", caseInsensitiveMatch.data);
        return caseInsensitiveMatch;
      }
      
      // Additional strategy: Try with the original unprocessed code as last resort
      if (code !== processedCode) {
        console.log("[InvitationMatchingService] Trying with original unprocessed code:", code);
        const originalCodeMatch = await findExactInvitationMatch(code);
        if (originalCodeMatch.data) {
          console.log("[InvitationMatchingService] Found match with original code:", originalCodeMatch.data);
          return originalCodeMatch;
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

/**
 * Try a direct database match using the DB function
 */
async function findDirectDatabaseMatch(code: string) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Call the database function to find matches
    const { data, error } = await supabase
      .rpc('find_classroom_invitation_matches', { code })
      .single();

    if (error) {
      console.error("[findDirectDatabaseMatch] DB error:", error);
      return { 
        data: null, 
        error: { message: error.message || "Error finding classroom or invitation" } 
      };
    }

    if (!data) {
      console.log("[findDirectDatabaseMatch] No match found in database for:", code);
      return { 
        data: null, 
        error: { message: "Invalid or expired invitation code" } 
      };
    }

    console.log("[findDirectDatabaseMatch] Found match in database:", data);

    // Transform the database result to match JoinClassroomResult interface
    const result: JoinClassroomResult = {
      classroomId: data.classroom_id,
      invitationId: data.id || undefined,
      classroom: {
        id: data.classroom_id,
        name: data.classroom_name || "Classroom",
        description: data.classroom_description || "",
        teacher_id: data.classroom_teacher_id
      }
    };

    return { 
      data: result, 
      error: null 
    };
  } catch (err: any) {
    console.error("[findDirectDatabaseMatch] Unexpected error:", err);
    return { 
      data: null, 
      error: { message: err.message || "Something went wrong. Please try again." } 
    };
  }
}
