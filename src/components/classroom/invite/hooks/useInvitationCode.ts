
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseInvitationCodeProps {
  classroomId: string;
}

export const useInvitationCode = ({ classroomId }: UseInvitationCodeProps) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate a new invitation code
  const generateInviteCode = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[useInvitationCode] Generating new invitation code for classroom:", classroomId);
      
      // Generate a simple, readable alphanumeric code (6 characters)
      const invitationToken = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      // Store the invitation code in Supabase
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app', // Marker for general invitations
          invitation_token: invitationToken,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .select()
        .single();
      
      if (inviteError) {
        throw new Error(inviteError.message || 'Failed to generate invitation code');
      }
      
      console.log("[useInvitationCode] Invitation created successfully:", invitation);
      setInvitationCode(invitation.invitation_token);
      
      toast({
        title: "Success",
        description: "New invitation code generated",
      });
    } catch (error: any) {
      console.error("[useInvitationCode] Error generating invitation code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [classroomId, toast]);

  // Function to get the full join URL
  const getJoinUrl = useCallback(() => {
    if (!invitationCode) return '';
    return `${window.location.origin}/classes?code=${invitationCode}`;
  }, [invitationCode]);

  return {
    invitationCode,
    setInvitationCode,
    loading,
    generateInviteCode,
    getJoinUrl,
  };
};
