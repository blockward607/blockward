
import { codeExtractor } from "@/utils/codeExtractor";

/**
 * Extract and format invitation code from various input formats
 * Acts as a facade for the codeExtractor utility
 */
export const extractInvitationCode = (input: string): string | null => {
  if (!input) return null;
  
  // Clean the input
  const cleanInput = input.trim();
  
  try {
    // First try using the utility
    const extractedCode = codeExtractor.extractJoinCode(cleanInput);
    
    if (extractedCode) {
      console.log("[extractInvitationCode] Extracted code:", extractedCode);
      return extractedCode;
    }
    
    // Try permissive extraction if standard fails
    const permissiveCode = codeExtractor.extractInvitationToken(cleanInput);
    if (permissiveCode) {
      console.log("[extractInvitationCode] Using permissive extraction:", permissiveCode);
      return permissiveCode;
    }
    
    // Fallback: Check if the code is directly valid (in case the utility failed)
    // Common format for invitation codes is 6-10 alphanumeric characters
    if (/^[A-Za-z0-9]{4,10}$/.test(cleanInput)) {
      return cleanInput.toUpperCase();
    }
    
    // No valid code found
    console.log("[extractInvitationCode] No valid code found in:", cleanInput);
    return null;
  } catch (error) {
    console.error("[extractInvitationCode] Error extracting code:", error);
    // Fallback in case of error: just return the cleaned input if it looks reasonable
    if (cleanInput.length >= 4 && cleanInput.length <= 20) {
      return cleanInput.toUpperCase();
    }
    return null;
  }
};
