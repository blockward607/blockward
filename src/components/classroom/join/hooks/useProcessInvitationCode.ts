
import { codeExtractor } from '@/utils/codeExtractor';

export const useProcessInvitationCode = () => {
  // Extract and format the invitation code
  const processInvitationCode = (input: string): string => {
    if (!input) return '';
    
    // First try the standard extraction
    const extractedCode = codeExtractor.extractJoinCode(input);
    
    // If standard extraction fails, try the more permissive method
    if (!extractedCode) {
      const permissiveCode = codeExtractor.extractInvitationToken(input);
      if (permissiveCode) {
        console.log("Using permissive code extraction:", permissiveCode);
        return permissiveCode;
      }
    }
    
    // Return the extracted code or the cleaned input as fallback
    return extractedCode || input.trim();
  };

  return {
    processInvitationCode
  };
};
