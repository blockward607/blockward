
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JoinClassroomResult } from "./types";

export class InvitationMatchingService {
  // Extract code from various input formats (URL, plain code, etc.)
  public static extractCodeFromInput(input: string): string | null {
    try {
      if (!input) return null;
      
      // Trim whitespace
      const cleanInput = input.trim();
      
      // Check if it's a URL
      if (cleanInput.includes('://')) {
        try {
          // Try to extract from URL params
          const url = new URL(cleanInput);
          const codeParam = url.searchParams.get('code') || url.searchParams.get('join');
          if (codeParam) return codeParam;
          
          // Check path segments for code-like patterns
          const pathSegments = url.pathname.split('/');
          for (const segment of pathSegments) {
            // Look for UK-prefixed codes (our standard format) or other code patterns
            if (/^UK[A-Z0-9]{4}$/i.test(segment)) {
              return segment;
            }
          }
        } catch (err) {
          console.error("[InvitationMatchingService] Error parsing URL:", err);
        }
      }
      
      // Check if it matches our standard code format (UK + 4-6 alphanumeric)
      if (/^UK[A-Z0-9]{4,6}$/i.test(cleanInput)) {
        return cleanInput.toUpperCase();
      }
      
      // If nothing else matched, return the cleaned input
      return cleanInput;
    } catch (err) {
      console.error("[InvitationMatchingService] Error extracting code:", err);
      return null;
    }
  }

  // Try to find and match an invitation code
  public static async matchInvitationCode(code: string): Promise<{ success: boolean; error?: string; classroomId?: string; invitationId?: string }> {
    try {
      console.log("[InvitationMatchingService] Trying to match invitation code:", code);
      
      if (!code) {
        return { success: false, error: "No invitation code provided" };
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: "You must be signed in to join a class" };
      }

      // First, check for direct match on invitation_token
      let { data: invitation, error } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, expires_at, status')
        .eq('invitation_token', code)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error("[InvitationMatchingService] Error checking invitation:", error);
        return { success: false, error: "Error checking invitation" };
      }

      if (invitation) {
        // Check if invitation has expired
        const expiresAt = new Date(invitation.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          return { success: false, error: "This invitation has expired" };
        }
        
        return { 
          success: true, 
          classroomId: invitation.classroom_id,
          invitationId: invitation.id
        };
      }
      
      // If no direct match, try to find classroom by join code
      // Some educators might use a classroom ID as the join code
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('id', code)
        .maybeSingle();
        
      if (classroomError) {
        console.error("[InvitationMatchingService] Error checking classroom:", classroomError);
      }
      
      if (classroom) {
        return { 
          success: true, 
          classroomId: classroom.id
        };
      }

      // No matches found
      return { success: false, error: "Invalid or expired invitation code" };
    } catch (err) {
      console.error("[InvitationMatchingService] Error in matchInvitationCode:", err);
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }

  // Find classroom or invitation by code - our comprehensive method
  public static async findClassroomOrInvitation(code: string): Promise<{ data: JoinClassroomResult | null; error: { message: string } | null }> {
    try {
      console.log("[InvitationMatchingService] Finding classroom or invitation for code:", code);
      
      if (!code) {
        return { 
          data: null, 
          error: { message: "No invitation code provided" } 
        };
      }

      // Process code to handle various formats
      const processedCode = this.extractCodeFromInput(code);
      if (!processedCode) {
        return { 
          data: null, 
          error: { message: "Invalid code format" } 
        };
      }
      
      console.log("[InvitationMatchingService] Processed code:", processedCode);

      // IMPORTANT: First try to find a match on the exact invitation token
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, expires_at, status, classroom:classrooms(id, name, description, teacher_id)')
        .eq('invitation_token', processedCode)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (inviteError && !inviteError.message.includes('No rows found')) {
        console.error("[InvitationMatchingService] Error checking invitation:", inviteError);
        return { 
          data: null, 
          error: { message: "Error checking invitation" } 
        };
      }
      
      // If valid invitation found
      if (invitation) {
        // Check if invitation has expired
        const expiresAt = new Date(invitation.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          return { 
            data: null, 
            error: { message: "This invitation has expired" } 
          };
        }
        
        return { 
          data: {
            classroomId: invitation.classroom_id,
            invitationId: invitation.id,
            classroom: invitation.classroom
          }, 
          error: null 
        };
      }
      
      // If no invitation found, try to find classroom by ID (legacy support)
      // This can happen if a teacher shares a direct classroom ID
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, name, description, teacher_id')
        .eq('id', processedCode)
        .maybeSingle();
        
      if (classroomError && !classroomError.message.includes('No rows found')) {
        console.error("[InvitationMatchingService] Error checking classroom:", classroomError);
        return { 
          data: null, 
          error: { message: "Error checking classroom" } 
        };
      }
      
      if (classroom) {
        return { 
          data: {
            classroomId: classroom.id,
            classroom: classroom
          }, 
          error: null 
        };
      }
      
      // Try to find invitation with a code format (UK + digits)
      // This is our primary invitation code format for students
      if (/^UK[A-Z0-9]{4,6}$/i.test(processedCode)) {
        console.log("[InvitationMatchingService] Looking for UK-format invitation code");
        
        // Look for invitation codes in the database
        const { data: ukInvitations, error: ukError } = await supabase
          .from('class_invitations')
          .select('id, classroom_id, expires_at, status, classroom:classrooms(id, name, description, teacher_id)')
          .ilike('invitation_token', `%${processedCode}%`) 
          .eq('status', 'pending')
          .limit(1);
          
        if (ukError) {
          console.error("[InvitationMatchingService] Error checking UK-format invitation:", ukError);
          return { 
            data: null, 
            error: { message: "Error checking invitation" } 
          };
        }
        
        if (ukInvitations && ukInvitations.length > 0) {
          const invitation = ukInvitations[0];
          // Check if invitation has expired
          const expiresAt = new Date(invitation.expires_at);
          const now = new Date();
          
          if (expiresAt < now) {
            return { 
              data: null, 
              error: { message: "This invitation has expired" } 
            };
          }
          
          return { 
            data: {
              classroomId: invitation.classroom_id,
              invitationId: invitation.id,
              classroom: invitation.classroom
            }, 
            error: null 
          };
        }
      }
      
      // No valid matches found
      return { 
        data: null, 
        error: { message: "Invalid or expired invitation code" } 
      };
    } catch (err: any) {
      console.error("[InvitationMatchingService] Error in findClassroomOrInvitation:", err);
      return { 
        data: null, 
        error: { message: err.message || "Something went wrong. Please try again." } 
      };
    }
  }

  // Enroll a student in a classroom
  public static async enrollStudentInClass(userId: string, classroomId: string, invitationId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("[InvitationMatchingService] Enrolling student in class:", { userId, classroomId, invitationId });
      
      // First, check if student profile exists
      const { data: studentProfile, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (studentError) {
        console.error("[InvitationMatchingService] Error checking student profile:", studentError);
        return { success: false, error: "Error checking student profile" };
      }
      
      let studentId: string;
      
      if (!studentProfile) {
        // Create a student profile if it doesn't exist
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            user_id: userId,
            name: 'New Student', // Default name
            points: 0
          })
          .select('id')
          .single();
          
        if (createError) {
          console.error("[InvitationMatchingService] Error creating student profile:", createError);
          return { success: false, error: "Error creating student profile" };
        }
        
        studentId = newStudent.id;
      } else {
        studentId = studentProfile.id;
      }
      
      // Check if student is already enrolled in this class
      const { data: existingEnrollment, error: enrollmentError } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('student_id', studentId)
        .eq('classroom_id', classroomId)
        .maybeSingle();
        
      if (enrollmentError) {
        console.error("[InvitationMatchingService] Error checking enrollment:", enrollmentError);
        return { success: false, error: "Error checking enrollment" };
      }
      
      if (existingEnrollment) {
        return { success: true }; // Already enrolled, just return success
      }
      
      // Enroll the student in the classroom
      const { error: joinError } = await supabase
        .from('classroom_students')
        .insert({
          student_id: studentId,
          classroom_id: classroomId
        });
        
      if (joinError) {
        console.error("[InvitationMatchingService] Error enrolling student:", joinError);
        return { success: false, error: "Error enrolling in class" };
      }
      
      // If there was an invitation ID, mark it as accepted
      if (invitationId) {
        const { error: updateError } = await supabase
          .from('class_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitationId);
          
        if (updateError) {
          console.error("[InvitationMatchingService] Error updating invitation status:", updateError);
          // Don't return error here as the student was successfully enrolled
        }
      }
      
      // Success!
      return { success: true };
    } catch (err) {
      console.error("[InvitationMatchingService] Error in enrollStudentInClass:", err);
      return { success: false, error: "Something went wrong during enrollment. Please try again." };
    }
  }
}
