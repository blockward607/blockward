import { supabase } from "@/integrations/supabase/client";
import { ClassInvitation } from "./types";

interface InvitationResult {
  id: string;
  classroom_id: string;
  invitation_token: string;
  status: string;
  expires_at: string;
}

export const InvitationMatchingService = {
  /**
   * Try all possible ways to find a classroom or invitation by code
   */
  findClassroomOrInvitation: async (code: string): Promise<{ data: ClassInvitation | null, error: any }> => {
    try {
      console.log("Searching for classroom or invitation with code:", code);
      const cleanCode = code.trim().toUpperCase();
      
      // First, try to find a direct class invitation by token
      const { data: invitationData, error: invitationError } = await supabase
        .from('class_invitations')
        .select('id, invitation_token, classroom_id, classrooms(id, name)')
        .eq('invitation_token', cleanCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (invitationError && !invitationError.message.includes('No rows found')) {
        console.error("Error finding invitation:", invitationError);
        throw invitationError;
      }
      
      if (invitationData) {
        console.log("Found invitation:", invitationData);
        return {
          data: {
            id: invitationData.id,
            code: invitationData.invitation_token,
            classroomId: invitationData.classroom_id,
            classroomName: invitationData.classrooms?.name || "Classroom",
            invitationId: invitationData.id,
            classroom: invitationData.classrooms
          },
          error: null
        };
      }
      
      // Try using regular query as a fallback for DB function
      // This works around the type issue with the RPC function
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('class_invitations')
        .select('id, invitation_token, classroom_id, status, expires_at')
        .eq('invitation_token', cleanCode)
        .eq('status', 'pending')
        .lt('expires_at', 'now()')
        .maybeSingle();

      if (fallbackData) {
        // Get classroom details
        const { data: classroomData } = await supabase
          .from('classrooms')
          .select('name, id')
          .eq('id', fallbackData.classroom_id)
          .maybeSingle();
        
        console.log("Found invitation via fallback query:", fallbackData);
        return {
          data: {
            id: fallbackData.id,
            code: fallbackData.invitation_token,
            classroomId: fallbackData.classroom_id,
            classroomName: classroomData?.name || "Classroom",
            invitationId: fallbackData.id,
            classroom: classroomData || undefined
          },
          error: null
        };
      }
      
      // As a fallback, try to look for a classroom with matching code
      // This is unlikely but we'll keep it for backward compatibility
      const { data: classroomData, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, name')
        .ilike('name', `%${cleanCode}%`)
        .limit(1);
      
      if (classroomError) {
        console.error("Error finding classroom:", classroomError);
        throw classroomError;
      }
      
      if (classroomData && classroomData.length > 0) {
        console.log("Found classroom with matching name:", classroomData[0]);
        return {
          data: {
            id: classroomData[0].id,
            code: cleanCode,
            classroomId: classroomData[0].id,
            classroomName: classroomData[0].name,
            classroom: classroomData[0]
          },
          error: null
        };
      }
      
      // If we get here, we didn't find anything
      console.log("No matching invitation or classroom found for code:", cleanCode);
      return {
        data: null,
        error: { message: "Invalid invitation code. Please check and try again." }
      };
    } catch (error: any) {
      console.error("Error in findClassroomOrInvitation:", error);
      return {
        data: null,
        error: { message: error.message || "Error finding classroom" }
      };
    }
  },
  
  /**
   * Extract and clean a code from various input formats
   * Handles:
   * - Plain code (ABC123)
   * - URL with code parameter (?code=ABC123)
   * - Full invitation URL (https://domain.com/join?code=ABC123)
   */
  extractCodeFromInput: (input: string): string => {
    if (!input) return '';
    
    // Clean the input string
    const cleaned = input.trim();
    
    // Check if it's a URL with a code parameter
    try {
      // If it looks like a URL, try to extract code parameter
      if (cleaned.includes('://') || cleaned.includes('?code=')) {
        const url = cleaned.includes('://') ? cleaned : `https://example.com/${cleaned}`;
        const urlObj = new URL(url);
        const codeParam = urlObj.searchParams.get('code');
        if (codeParam) {
          return codeParam.toUpperCase();
        }
      }
    } catch (e) {
      // Not a valid URL, continue with other checks
    }
    
    // If the input contains only alphanumeric characters and is reasonably sized,
    // assume it's a direct code
    if (/^[A-Za-z0-9]{4,12}$/.test(cleaned)) {
      return cleaned.toUpperCase();
    }
    
    // Last resort: try to extract alphanumeric sequences that look like codes
    const matches = cleaned.match(/[A-Za-z0-9]{4,12}/);
    if (matches && matches.length > 0) {
      return matches[0].toUpperCase();
    }
    
    // Return the original input if we couldn't extract anything meaningful
    return cleaned.toUpperCase();
  }
};
