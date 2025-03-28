
import { supabase } from "@/integrations/supabase/client";
import type { JoinClassroomResult, SupabaseError } from "./types";
import { classCodeMatcher } from "@/utils/classCodeMatcher";
import { codeExtractor } from "@/utils/codeExtractor";

export const InvitationMatchingService = {
  /**
   * Extracts a code from various input formats:
   * - Direct code: "ABC123"
   * - URL: "https://example.com/join?code=ABC123"
   * - URL with path: "https://example.com/join/ABC123"
   */
  extractCodeFromInput(input: string): string | null {
    return codeExtractor.extractJoinCode(input);
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
