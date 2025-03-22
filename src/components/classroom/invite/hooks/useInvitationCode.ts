
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseInvitationCodeProps {
  classroomId: string;
}

export const useInvitationCode = ({ classroomId }: UseInvitationCodeProps) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch existing invitation code on mount
  useEffect(() => {
    const fetchExistingCode = async () => {
      if (!classroomId) return;
      
      try {
        setLoading(true);
        // Check if there's an existing invitation code for this classroom
        const { data, error } = await supabase
          .from('class_invitations')
          .select('invitation_token')
          .eq('classroom_id', classroomId)
          .eq('status', 'pending')
          .eq('email', 'general_invitation@blockward.app')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("[useInvitationCode] Found existing invitation code:", data[0].invitation_token);
          setInvitationCode(data[0].invitation_token);
        }
      } catch (err) {
        console.error("[useInvitationCode] Error fetching invitation code:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingCode();
  }, [classroomId]);

  // Generate a new invitation code
  const generateInviteCode = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[useInvitationCode] Generating new invitation code for classroom:", classroomId);
      
      // Generate a simple, readable alphanumeric code (6 characters)
      const invitationToken = 'UK' + Array.from({length: 4}, () => 
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
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
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
