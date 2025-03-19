
import { supabase } from '@/integrations/supabase/client';

export const InvitationService = {
  // Validate an invitation code
  validateInvitationCode: async (code: string) => {
    console.log('Validating invitation code:', code);
    try {
      const { data, error } = await supabase
        .from('class_invitations')
        .select('*, classroom:classrooms(*)')
        .eq('invitation_token', code)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (error) {
        console.error('Error validating invitation code:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No valid invitation found with this code');
        return { data: null };
      }
      
      return { data };
    } catch (error) {
      console.error('Exception validating invitation code:', error);
      throw error;
    }
  },
  
  // Enroll a student in a classroom
  enrollStudentInClassroom: async (studentId: string, classroomId: string) => {
    console.log('Enrolling student in classroom:', { studentId, classroomId });
    
    try {
      // First check if student is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('classroom_students')
        .select('*')
        .eq('student_id', studentId)
        .eq('classroom_id', classroomId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking enrollment:', checkError);
        throw checkError;
      }
        
      if (existingEnrollment) {
        console.log('Student already enrolled in this classroom');
        return { data: existingEnrollment, alreadyEnrolled: true };
      }
      
      // If not enrolled, add the student to the classroom
      const { data, error } = await supabase
        .from('classroom_students')
        .insert({
          student_id: studentId,
          classroom_id: classroomId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error enrolling student:', error);
        throw error;
      }
      
      console.log('Student enrolled successfully:', data);
      return { data, alreadyEnrolled: false };
    } catch (error) {
      console.error('Exception enrolling student:', error);
      throw error;
    }
  },
  
  // Generate and store classroom invitation
  createClassInvitation: async (classroomId: string, email: string = 'general_invitation@blockward.app') => {
    console.log('Creating class invitation:', { classroomId, email });
    try {
      // Generate a unique code
      const token = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      const { data, error } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: email.toLowerCase(),
          invitation_token: token,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }
      
      console.log('Invitation created successfully:', data);
      return { data, error };
    } catch (error) {
      console.error('Exception creating invitation:', error);
      throw error;
    }
  },
  
  // Send email invitation to a student
  sendEmailInvitation: async (email: string, teacherName: string, classroomName: string, invitationToken: string) => {
    // This would integrate with an email service in production
    console.log('Sending email invitation:', { email, teacherName, classroomName, invitationToken });
    
    // For now, we'll just simulate a successful email sending
    console.log(`Email would be sent to ${email} from ${teacherName} to join ${classroomName} with token ${invitationToken}`);
    
    // In a real implementation, you'd use an email service API
    return { success: true, message: 'Invitation sent successfully' };
  }
};
