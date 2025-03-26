
import { supabase } from "@/integrations/supabase/client";
import type { JoinClassroomResult, SupabaseError } from "./types";
import { classCodeMatcher } from "@/utils/classCodeMatcher";

export const InvitationMatchingService = {
  /**
   * Extracts a code from various input formats:
   * - Direct code: "ABC123"
   * - URL: "https://example.com/join?code=ABC123"
   * - URL with path: "https://example.com/join/ABC123"
   */
  extractCodeFromInput(input: string): string | null {
    if (!input) return null;
    
    // Clean the input
    input = input.trim();
    
    try {
      // Check if it's a URL and try to extract code from it
      if (input.includes('://') || input.startsWith('www.')) {
        // Try to extract code from URL query parameter
        try {
          const url = new URL(input.startsWith('www.') ? `https://${input}` : input);
          
          // Check for code in query parameters with different possible names
          const codeFromQuery = url.searchParams.get('code') || 
                               url.searchParams.get('join') || 
                               url.searchParams.get('invite') ||
                               url.searchParams.get('class');
          
          if (codeFromQuery) {
            return codeFromQuery;
          }
          
          // Check for code in path segments
          const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
          for (const segment of pathSegments) {
            // Look for segments that might be codes (alphanumeric, 5-10 chars)
            if (/^[A-Za-z0-9]{5,10}$/.test(segment)) {
              return segment;
            }
          }
          
          // Get the last path segment as a fallback
          if (pathSegments.length > 0) {
            return pathSegments[pathSegments.length - 1];
          }
        } catch (e) {
          console.log('Failed to parse URL:', e);
          // If URL parsing fails, treat as a regular code
        }
      }
      
      // If it looks like a code (5-10 alphanumeric characters), return it
      if (/^[A-Za-z0-9]{5,10}$/.test(input)) {
        return input.toUpperCase();
      }
      
      // Try extracting code from text that contains code pattern
      const codeMatch = input.match(/\b([A-Za-z0-9]{5,10})\b/);
      if (codeMatch) {
        return codeMatch[1].toUpperCase();
      }
      
      // If all else fails and the input is reasonably short, return it as-is
      if (input.length <= 20) {
        return input.toUpperCase();
      }
    } catch (e) {
      console.error('Error extracting code from input:', e);
    }
    
    return null;
  },
  
  /**
   * Find a classroom or invitation by code using multiple matching strategies
   */
  async findClassroomOrInvitation(code: string): Promise<{ data: JoinClassroomResult | null, error: SupabaseError | null }> {
    if (!code) {
      return { 
        data: null, 
        error: { message: 'No code provided' } 
      };
    }
    
    try {
      // First try to match against an invitation token directly
      console.log('Looking for invitation with token:', code);
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .select('*, classroom:classrooms(*)')
        .eq('invitation_token', code)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
        
      if (inviteError && !inviteError.message.includes('No rows found')) {
        console.error('Error finding invitation:', inviteError);
        return { data: null, error: inviteError };
      }
      
      if (invitation) {
        console.log('Found invitation:', invitation);
        return {
          data: {
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: invitation.classroom
          },
          error: null
        };
      }
      
      // If no invitation found, try matching against a classroom ID prefix
      console.log('Looking for classroom with ID starting with:', code);
      const { data: classrooms, error: classroomError } = await supabase
        .from('classrooms')
        .select('*');
        
      if (classroomError) {
        console.error('Error finding classrooms:', classroomError);
        return { data: null, error: classroomError };
      }
      
      // Try various matching strategies if we have classrooms
      if (classrooms && classrooms.length > 0) {
        // Find by ID prefix match
        const matchedClassroom = classCodeMatcher.findClassroomByPrefix(classrooms, code);
        
        if (matchedClassroom) {
          console.log('Found classroom by ID prefix:', matchedClassroom);
          return {
            data: {
              classroomId: matchedClassroom.id,
              classroom: matchedClassroom
            },
            error: null
          };
        }
        
        // Find by partial/case-insensitive match
        const caseInsensitiveMatch = classCodeMatcher.findClassroomByCaseInsensitive(classrooms, code);
        
        if (caseInsensitiveMatch) {
          console.log('Found classroom by case-insensitive match:', caseInsensitiveMatch);
          return {
            data: {
              classroomId: caseInsensitiveMatch.id,
              classroom: caseInsensitiveMatch
            },
            error: null
          };
        }
      }
      
      // No results found with any strategy
      return { 
        data: null, 
        error: { message: 'No matching class found for this code' } 
      };
    } catch (err: any) {
      console.error('Exception in findClassroomOrInvitation:', err);
      return { 
        data: null, 
        error: { 
          message: err.message || 'Error finding classroom' 
        } 
      };
    }
  }
};
