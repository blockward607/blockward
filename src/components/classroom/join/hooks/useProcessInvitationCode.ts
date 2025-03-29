
import { codeExtractor } from '@/utils/codeExtractor';

export const useProcessInvitationCode = () => {
  // Extract and format the invitation code
  const processInvitationCode = (input: string): string => {
    const cleanCode = input.trim();
    // Process code to extract the actual invitation code (handle URLs, etc.)
    return codeExtractor.extractJoinCode(cleanCode) || cleanCode;
  };

  return {
    processInvitationCode
  };
};
