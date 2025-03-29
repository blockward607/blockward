
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

      // Strategy 1: Try exact invitation token match
      const exactMatch = await findExactInvitationMatch(processedCode);
      if (exactMatch.error || exactMatch.data) {
        return exactMatch;
      }
      
      // Strategy 2: Try classroom ID match (legacy support)
      const classroomMatch = await findClassroomById(processedCode);
      if (classroomMatch.error || classroomMatch.data) {
        return classroomMatch;
      }
      
      // Strategy 3: Try broader partial match for UK-format codes
      const partialMatch = await findPartialInvitationMatch(processedCode);
      if (partialMatch.error || partialMatch.data) {
        return partialMatch;
      }
      
      // Strategy 4: Try case-insensitive exact match
      const caseInsensitiveMatch = await findCaseInsensitiveMatch(processedCode);
      if (caseInsensitiveMatch.error || caseInsensitiveMatch.data) {
        return caseInsensitiveMatch;
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
