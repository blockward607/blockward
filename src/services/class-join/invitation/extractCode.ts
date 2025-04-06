
/**
 * Extracts an invitation code from different input formats
 */
export const extractInvitationCode = (input: string): string | null => {
  if (!input || typeof input !== 'string') return null;
  
  // Clean up the input string
  const cleanInput = input.trim().toUpperCase();
  
  // If it's already in the expected format (e.g. UK1234), return it directly
  if (/^UK[A-Z0-9]{4}$/i.test(cleanInput)) {
    return cleanInput;
  }
  
  // Try to extract a UK code pattern
  const ukCodeMatch = cleanInput.match(/UK[A-Z0-9]{4}/i);
  if (ukCodeMatch) {
    return ukCodeMatch[0];
  }
  
  // If input is a URL, try to extract code from URL parameters
  if (cleanInput.includes('://')) {
    try {
      const url = new URL(cleanInput);
      const code = url.searchParams.get('code');
      if (code) {
        return code.toUpperCase();
      }
    } catch (error) {
      console.error("Error parsing URL:", error);
    }
  }
  
  // If it looks like a regular code (4-8 alphanumeric characters), return it
  if (/^[A-Z0-9]{4,8}$/i.test(cleanInput)) {
    return cleanInput;
  }
  
  // If all else fails, just return the input as is
  return cleanInput;
};

/**
 * Helper function to normalize codes for comparison
 */
export const normalizeCode = (code: string): string => {
  if (!code) return '';
  return code.trim().toUpperCase().replace(/\s+/g, '');
};
