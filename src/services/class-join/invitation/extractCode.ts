
import { codeExtractor } from "@/utils/codeExtractor";

/**
 * Extract and format invitation code from various input formats
 * Acts as a facade for the codeExtractor utility
 */
export const extractInvitationCode = (input: string): string | null => {
  if (!input) return null;
  
  // Delegate to the codeExtractor utility
  return codeExtractor.extractJoinCode(input);
};
