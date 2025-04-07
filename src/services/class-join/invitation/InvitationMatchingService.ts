
import { JoinClassroomResult } from "../types";
import { extractInvitationCode } from "./extractCode";
import { findExactInvitationMatch } from "./findExactMatch";
import { findClassroomById } from "./findClassroomById";
import { findPartialInvitationMatch } from "./findPartialMatch";
import { findCaseInsensitiveMatch } from "./findCaseInsensitiveMatch";
import { supabase } from "@/integrations/supabase/client";

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

      // Remove any spaces and convert to uppercase for consistent matching
      const cleanedCode = code.trim().toUpperCase();
      console.log("[InvitationMatchingService] Using cleaned code:", cleanedCode);

      // Simple direct database check first - most reliable way to verify
      const { data: directMatches, error: matchError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, classroom:classrooms(id, name, description, teacher_id)')
        .eq('invitation_token', cleanedCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (!matchError && directMatches) {
        console.log("[InvitationMatchingService] Found direct match for code:", directMatches);
        
        return { 
          data: {
            classroomId: directMatches.classroom_id,
            invitationId: directMatches.id,
            classroom: directMatches.classroom
          }, 
          error: null 
        };
      }

      // Try exact code match next
      const exactMatch = await findExactInvitationMatch(cleanedCode);
      if (exactMatch.data) {
        console.log("[InvitationMatchingService] Found exact match:", exactMatch.data);
        return exactMatch;
      }
      
      // Try classroom ID match (for direct classroom ID input)
      const classroomMatch = await findClassroomById(cleanedCode);
      if (classroomMatch.data) {
        console.log("[InvitationMatchingService] Found classroom match:", classroomMatch.data);
        return classroomMatch;
      }
      
      // Try partial match (for codes like UK5CRH)
      const partialMatch = await findPartialInvitationMatch(cleanedCode);
      if (partialMatch.data) {
        console.log("[InvitationMatchingService] Found partial match:", partialMatch.data);
        return partialMatch;
      }
      
      // Try case insensitive match
      const caseInsensitiveMatch = await findCaseInsensitiveMatch(cleanedCode);
      if (caseInsensitiveMatch.data) {
        console.log("[InvitationMatchingService] Found case-insensitive match:", caseInsensitiveMatch.data);
        return caseInsensitiveMatch;
      }

      // No valid matches found
      return { 
        data: null, 
        error: { message: "Invalid invitation code. Please check and try again." } 
      };
    } catch (err: any) {
      console.error("[InvitationMatchingService] Error in findClassroomOrInvitation:", err);
      return { 
        data: null, 
        error: { message: "Something went wrong. Please try again." } 
      };
    }
  }
}
