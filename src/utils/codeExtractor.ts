
/**
 * Utility to extract invitation codes from various formats
 */

/**
 * Extracts a join code from various input formats:
 * - Direct code: "ABC123"
 * - URL: "https://example.com/join?code=ABC123"
 * - URL with path: "https://example.com/join/ABC123"
 * - Supporting multiple URL formats and patterns
 */
export function extractJoinCode(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  // Clean the input
  const cleanInput = input.trim();
  
  try {
    // First check if it's already a valid code format (UKXXXX)
    if (/^UK[A-Z0-9]{4,6}$/i.test(cleanInput)) {
      return cleanInput.toUpperCase();
    }
    
    // Look for UK + 4-6 chars pattern anywhere in the string
    const ukCodeMatch = cleanInput.match(/UK[A-Z0-9]{4,6}/i);
    if (ukCodeMatch) {
      return ukCodeMatch[0].toUpperCase();
    }
    
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
          // If the param is a valid UKXXXX format or similar, return it
          if (/^UK[A-Z0-9]{4,6}$/i.test(codeParam)) {
            return codeParam.toUpperCase();
          }
          
          // Look for UK pattern in the parameter
          const paramUkMatch = codeParam.match(/UK[A-Z0-9]{4,6}/i);
          if (paramUkMatch) {
            return paramUkMatch[0].toUpperCase();
          }
          
          // Otherwise just return the parameter as is
          return codeParam.toUpperCase();
        }
        
        // Check for UK pattern in the path
        const pathString = url.pathname;
        const pathUkMatch = pathString.match(/UK[A-Z0-9]{4,6}/i);
        if (pathUkMatch) {
          return pathUkMatch[0].toUpperCase();
        }
        
        // Check for code in path segments
        const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
        for (const segment of pathSegments) {
          // Look for segments that look like codes (alphanumeric, 4-10 chars)
          if (/^[A-Za-z0-9]{4,10}$/.test(segment)) {
            return segment.toUpperCase();
          }
          
          // Check for UK pattern in segment
          const segmentUkMatch = segment.match(/UK[A-Z0-9]{4,6}/i);
          if (segmentUkMatch) {
            return segmentUkMatch[0].toUpperCase();
          }
        }
        
        // Get the last path segment as a fallback
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          if (lastSegment.length >= 4 && lastSegment.length <= 10) {
            return lastSegment.toUpperCase();
          }
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }
    
    // Check if it looks like a class code (4-10 alphanumeric chars)
    if (/^[A-Za-z0-9]{4,10}$/.test(cleanInput)) {
      return cleanInput.toUpperCase();
    }
    
    // Try to extract a code pattern from text
    const codeMatch = cleanInput.match(/[A-Za-z0-9]{4,10}/);
    if (codeMatch) {
      return codeMatch[0].toUpperCase();
    }
    
    // If all else fails, just return the cleaned input if it's not too long
    if (cleanInput.length >= 4 && cleanInput.length <= 20) {
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
