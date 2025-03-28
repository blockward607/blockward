
/**
 * Utility to extract invitation codes from various formats
 */

/**
 * Extracts a join code from various input formats:
 * - Direct code: "ABC123"
 * - URL: "https://example.com/join?code=ABC123"
 * - URL with path: "https://example.com/join/ABC123"
 */
export function extractJoinCode(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  // Clean the input
  const cleanInput = input.trim();
  
  try {
    // Check if it's a URL and try to extract code from it
    if (cleanInput.includes('://') || cleanInput.startsWith('www.')) {
      const urlString = cleanInput.startsWith('www.') ? `https://${cleanInput}` : cleanInput;
      
      try {
        const url = new URL(urlString);
        
        // Check for code in query parameters with different possible names
        const codeParam = url.searchParams.get('code') || 
                        url.searchParams.get('join') || 
                        url.searchParams.get('invite') ||
                        url.searchParams.get('c');
        
        if (codeParam) {
          return codeParam.toUpperCase();
        }
        
        // Check for code in path segments
        const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
        for (const segment of pathSegments) {
          // Look for segments that look like codes (alphanumeric, 5-10 chars)
          if (/^[A-Za-z0-9]{4,10}$/.test(segment)) {
            return segment.toUpperCase();
          }
        }
        
        // Get the last path segment as a fallback
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          return lastSegment.toUpperCase();
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }
    
    // Check if it already looks like a class code (5-10 alphanumeric chars)
    if (/^[A-Za-z0-9]{4,10}$/.test(cleanInput)) {
      return cleanInput.toUpperCase();
    }
    
    // Try to extract a code pattern from text
    const codeMatch = cleanInput.match(/[A-Za-z0-9]{4,10}/);
    if (codeMatch) {
      return codeMatch[0].toUpperCase();
    }
    
    // If all else fails, just return the cleaned input
    if (cleanInput.length <= 20) {
      return cleanInput.toUpperCase();
    }
  } catch (e) {
    console.error('Error extracting code:', e);
  }
  
  return null;
}

export const codeExtractor = {
  extractJoinCode
};
