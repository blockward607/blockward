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
  
  try {
    // Clean the input
    const cleanInput = input.trim();
    console.log('Extracting code from input:', cleanInput);
    
    // First check if it's already a valid code format (UKXXXX)
    if (/^UK[A-Z0-9]{4,6}$/i.test(cleanInput)) {
      console.log('Direct UK code match:', cleanInput.toUpperCase());
      return cleanInput.toUpperCase();
    }
    
    // Look for UK + 4-6 chars pattern anywhere in the string
    const ukCodeMatch = cleanInput.match(/UK[A-Z0-9]{4,6}/i);
    if (ukCodeMatch) {
      console.log('UK code pattern match:', ukCodeMatch[0].toUpperCase());
      return ukCodeMatch[0].toUpperCase();
    }
    
    // Check if it's a URL and try to extract code from it
    if (cleanInput.includes('://') || cleanInput.startsWith('www.')) {
      const urlString = cleanInput.startsWith('www.') ? `https://${cleanInput}` : cleanInput;
      
      try {
        const url = new URL(urlString);
        console.log('Parsed URL:', url.toString());
        
        // Check for code in query parameters with different possible names
        const codeParam = url.searchParams.get('code') || 
                        url.searchParams.get('join') || 
                        url.searchParams.get('invitation') ||
                        url.searchParams.get('invite') ||
                        url.searchParams.get('c');
        
        if (codeParam) {
          console.log('Found code in URL parameter:', codeParam);
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
          console.log('Found UK code in URL path:', pathUkMatch[0]);
          return pathUkMatch[0].toUpperCase();
        }
        
        // Check for code in path segments
        const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
        for (const segment of pathSegments) {
          // Look for segments that look like codes (alphanumeric, 4-10 chars)
          if (/^[A-Za-z0-9]{4,10}$/.test(segment)) {
            console.log('Found code-like segment in path:', segment.toUpperCase());
            return segment.toUpperCase();
          }
          
          // Check for UK pattern in segment
          const segmentUkMatch = segment.match(/UK[A-Z0-9]{4,6}/i);
          if (segmentUkMatch) {
            console.log('Found UK code in path segment:', segmentUkMatch[0]);
            return segmentUkMatch[0].toUpperCase();
          }
        }
        
        // Get the last path segment as a fallback
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          if (lastSegment.length >= 4 && lastSegment.length <= 10) {
            console.log('Using last path segment as code:', lastSegment.toUpperCase());
            return lastSegment.toUpperCase();
          }
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }
    
    // Check if it looks like a class code (4-10 alphanumeric chars)
    if (/^[A-Za-z0-9]{4,10}$/.test(cleanInput)) {
      console.log('Input matches code pattern:', cleanInput.toUpperCase());
      return cleanInput.toUpperCase();
    }
    
    // Try to extract a code pattern from text
    const codeMatch = cleanInput.match(/[A-Za-z0-9]{4,10}/);
    if (codeMatch) {
      console.log('Extracted code pattern from text:', codeMatch[0].toUpperCase());
      return codeMatch[0].toUpperCase();
    }
    
    // If all else fails, just return the cleaned input if it's not too long
    if (cleanInput.length >= 4 && cleanInput.length <= 20) {
      console.log('Using cleaned input as code:', cleanInput.toUpperCase());
      return cleanInput.toUpperCase();
    }
    
    console.log('No valid code found in input');
    return null;
  } catch (e) {
    console.error('Error extracting code:', e);
    return null;
  }
}

// Add more robust code extraction methods
export function extractInvitationToken(input: string): string | null {
  // First try the standard extraction
  const extractedCode = extractJoinCode(input);
  if (extractedCode) return extractedCode;
  
  // If that fails, try to handle edge cases
  try {
    const cleanInput = input.trim();
    
    // Try to find any alphanumeric sequence that could be a code
    // This is more permissive than the main function
    const possibleCodeMatches = cleanInput.match(/[A-Za-z0-9]{4,12}/g);
    if (possibleCodeMatches && possibleCodeMatches.length > 0) {
      // Return the longest match as it's most likely to be a code
      const longestMatch = possibleCodeMatches.reduce(
        (longest, current) => current.length > longest.length ? current : longest, 
        possibleCodeMatches[0]
      );
      
      console.log('Found possible code using permissive matching:', longestMatch);
      return longestMatch.toUpperCase();
    }
  } catch (e) {
    console.error('Error in permissive code extraction:', e);
  }
  
  return null;
}

export const codeExtractor = {
  extractJoinCode,
  extractInvitationToken
};
