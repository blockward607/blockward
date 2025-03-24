
import { supabase } from '@/integrations/supabase/client';
import { ClassInvitation } from './types';

export class InvitationMatchingService {
  /**
   * Generate a clean URL for joining a class without the domain
   * @param token The invitation token
   * @returns A join URL path
   */
  static getJoinPath(token: string): string {
    // Remove any special characters/whitespace and format the join code
    const cleanToken = token.trim().replace(/[^a-zA-Z0-9]/g, '');
    return `/join/${cleanToken}`;
  }
  
  /**
   * Generate a complete invitation URL for sharing
   * @param token The invitation token
   * @returns A complete URL for joining
   */
  static getJoinUrl(token: string): string {
    // Create a proper URL with the current domain
    const baseUrl = window.location.origin;
    return `${baseUrl}${this.getJoinPath(token)}`;
  }
  
  /**
   * Share invitation link using the Web Share API when available
   * @param invitationToken The token to share
   * @returns Promise<boolean> Whether sharing succeeded
   */
  static async shareInvitation(invitationToken: string): Promise<boolean> {
    try {
      const shareUrl = this.getJoinUrl(invitationToken);
      const shareData = {
        title: 'BlockWard Class Invitation',
        text: 'Join my class on BlockWard!',
        url: shareUrl,
      };
      
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
        return true;
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        return true;
      }
    } catch (error) {
      console.error("[InvitationMatchingService] Error sharing invitation:", error);
      return false;
    }
  }
  
  /**
   * Find a classroom invitation by code
   * @param code The invitation code to match
   * @returns Promise<ClassInvitation | null> The matching invitation or null
   */
  static async findInvitationByCode(code: string): Promise<ClassInvitation | null> {
    try {
      if (!code) {
        console.warn("[InvitationMatchingService] Empty code provided");
        return null;
      }
      
      // Clean up code by removing whitespace and special characters
      const cleanCode = code.trim().replace(/[^a-zA-Z0-9]/g, '');
      
      console.log("[InvitationMatchingService] Looking for code:", cleanCode);
      
      // Try direct DB query with proper parameters (most efficient)
      const { data: invitations, error: dbError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending')
        .filter('expires_at', 'gte', 'now()')
        .ilike('invitation_token', cleanCode)
        .limit(1);
        
      if (dbError) {
        console.error("[InvitationMatchingService] DB query error:", dbError);
      } else if (invitations && invitations.length > 0) {
        console.log("[InvitationMatchingService] Found match from DB query:", invitations[0]);
        const matchedInvite = invitations[0];
        
        // Get classroom details
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', matchedInvite.classroom_id)
          .single();
          
        if (classroom) {
          return {
            id: matchedInvite.id,
            code: cleanCode,
            classroomId: matchedInvite.classroom_id,
            classroomName: classroom.name
          };
        }
      }
      
      // If still no match, try with a fuzzy match as last resort
      const { data: fuzzyInvitations, error: fuzzyError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status, expires_at')
        .eq('status', 'pending')
        .filter('expires_at', 'gte', 'now()')
        .ilike('invitation_token', `%${cleanCode}%`)
        .limit(5);
      
      if (fuzzyError) {
        console.error("[InvitationMatchingService] Fuzzy query error:", fuzzyError);
      } else if (fuzzyInvitations && fuzzyInvitations.length > 0) {
        // Find the closest match
        const bestMatch = fuzzyInvitations.find(invite => 
          invite.invitation_token.toLowerCase().includes(cleanCode.toLowerCase())
        );
        
        if (bestMatch) {
          console.log("[InvitationMatchingService] Found fuzzy match:", bestMatch);
          
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', bestMatch.classroom_id)
            .single();
            
          if (classroom) {
            return {
              id: bestMatch.id,
              code: cleanCode,
              classroomId: bestMatch.classroom_id,
              classroomName: classroom.name
            };
          }
        }
      }
      
      console.log("[InvitationMatchingService] No match found for code:", cleanCode);
      return null;
      
    } catch (error) {
      console.error("[InvitationMatchingService] Error finding invitation:", error);
      return null;
    }
  }
}
