
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class InvitationMatchingService {
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
      // Some educators might set the classroom ID as the join code (legacy support)
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
