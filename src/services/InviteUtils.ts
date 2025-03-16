
import { supabase } from '@/integrations/supabase/client';

export const InviteUtils = {
  /**
   * Generate a random invitation token
   */
  generateInvitationToken: () => {
    return Array.from({length: 8}, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');
  },

  /**
   * Create a class invitation
   */
  createInvitation: async (classroomId: string, email: string = 'general_invitation@blockward.app') => {
    try {
      // Generate a unique code
      const token = InviteUtils.generateInvitationToken();
      
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
      return { data, error: null };
    } catch (error) {
      console.error('Exception creating invitation:', error);
      return { data: null, error };
    }
  },

  /**
   * Validate an invitation code
   */
  validateInvitationCode: async (code: string) => {
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
      
      return { data, error: null };
    } catch (error) {
      console.error('Exception validating invitation code:', error);
      return { data: null, error };
    }
  },

  /**
   * Send email invitation to a student
   */
  sendEmailInvitation: async (email: string, invitationToken: string, teacherName: string, classroomName: string) => {
    try {
      const response = await fetch("https://vuwowvhoiyzmnjuoawqz.supabase.co/functions/v1/send-verification", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1d293dmhvaXl6bW5qdW9hd3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNjYxNTAsImV4cCI6MjA1MTg0MjE1MH0.CMCrS1XZiO91JapxorBTUBeD4AD_lSFfa1hIjM7CMeg`
        },
        body: JSON.stringify({
          email,
          verificationToken: invitationToken,
          teacherName,
          className: classroomName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email invitation');
      }
      
      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('Error sending email invitation:', error);
      return { success: false, message: error.message || 'Failed to send invitation' };
    }
  }
};
