
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
      // Clean and normalize the code
      const cleanCode = code.trim().toUpperCase();
      console.log('Looking for invitation with token:', cleanCode);
      
      // First try to match against an invitation token directly
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .select('*, classroom:classrooms(*)')
        .eq('invitation_token', cleanCode)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
        
      if (inviteError && !inviteError.message.includes('No rows found')) {
        console.error('Error finding invitation:', inviteError);
        return { data: null, error: inviteError };
      }
      
      if (invitation) {
        console.log('Found invitation directly:', invitation);
        return {
          data: {
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: invitation.classroom
          },
          error: null
        };
      }
      
      // Second, try with more flexible matching for UK-prefixed codes
      if (/^UK/i.test(cleanCode)) {
        console.log('Trying flexible matching for UK-prefixed code');
        const { data: ukInvitations, error: ukError } = await supabase
          .from('class_invitations')
          .select('*, classroom:classrooms(*)')
          .ilike('invitation_token', cleanCode + '%')  // Code as prefix
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString());
          
        if (!ukError && ukInvitations && ukInvitations.length > 0) {
          console.log('Found invitation with prefix matching:', ukInvitations[0]);
          return {
            data: {
              classroomId: ukInvitations[0].classroom_id,
              invitationId: ukInvitations[0].id,
              classroom: ukInvitations[0].classroom
            },
            error: null
          };
        }
        
        // Try exact match by removing any non-alphanumeric characters
        const cleanedUKCode = cleanCode.replace(/[^A-Z0-9]/g, '');
        if (cleanedUKCode !== cleanCode) {
          const { data: cleanInvitations, error: cleanError } = await supabase
            .from('class_invitations')
            .select('*, classroom:classrooms(*)')
            .eq('invitation_token', cleanedUKCode)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();
            
          if (!cleanError && cleanInvitations) {
            console.log('Found invitation with cleaned code:', cleanInvitations);
            return {
              data: {
                classroomId: cleanInvitations.classroom_id,
                invitationId: cleanInvitations.id,
                classroom: cleanInvitations.classroom
              },
              error: null
            };
          }
        }
      }
      
      // Try to find by using the database function (more powerful SQL matching)
      console.log('Trying database function for flexible matching');
      const { data: dbMatches, error: dbError } = await supabase
        .rpc('find_invitation_by_code', { 
          code_param: cleanCode
        });
        
      if (!dbError && dbMatches && dbMatches.length > 0) {
        console.log('Found invitation using database function:', dbMatches[0]);
        
        // Get the classroom details
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('*')
          .eq('id', dbMatches[0].classroom_id)
          .maybeSingle();
          
        if (!classroomError && classroom) {
          return {
            data: {
              classroomId: dbMatches[0].classroom_id,
              invitationId: dbMatches[0].id,
              classroom: classroom
            },
            error: null
          };
        }
      }
      
      // If no invitation found, try matching against a classroom directly
      console.log('Looking for classroom with code:', cleanCode);
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
        const matchedClassroom = classCodeMatcher.findClassroomByPrefix(classrooms, cleanCode);
        
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
        const caseInsensitiveMatch = classCodeMatcher.findClassroomByCaseInsensitive(classrooms, cleanCode);
        
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
      
      // Special case for general invitations
      const { data: emailInvitations, error: emailInviteError } = await supabase
        .from('class_invitations')
        .select('*, classroom:classrooms(*)')
        .eq('email', 'general_invitation@blockward.app')
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
        
      if (!emailInviteError && emailInvitations && emailInvitations.length > 0) {
        // Look for a matching invitation based on partial code
        for (const invite of emailInvitations) {
          if (invite.invitation_token.includes(cleanCode) || cleanCode.includes(invite.invitation_token)) {
            console.log('Found matching general invitation:', invite);
            return {
              data: {
                classroomId: invite.classroom_id,
                invitationId: invite.id,
                classroom: invite.classroom
              },
              error: null
            };
          }
        }
      }
      
      // No results found with any strategy
      return { 
        data: null, 
        error: { message: 'No matching class found for this code. Please check the code and try again.' } 
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
