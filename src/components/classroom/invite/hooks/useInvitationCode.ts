
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
          .select('invitation_token, expires_at')
          .eq('classroom_id', classroomId)
          .eq('status', 'pending')
          .eq('email', 'general_invitation@blockward.app')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Check if the invitation is still valid
          const expiresAt = new Date(data[0].expires_at);
          const now = new Date();
          
          if (expiresAt > now) {
            console.log("[useInvitationCode] Found existing valid invitation code:", data[0].invitation_token);
            setInvitationCode(data[0].invitation_token);
          } else {
            console.log("[useInvitationCode] Found expired invitation, generating new one");
            await generateInviteCode();
          }
        }
      } catch (err) {
        console.error("[useInvitationCode] Error fetching invitation code:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingCode();
  }, [classroomId]);

  // Generate a random alphanumeric code with a consistent format
  const generateRandomCode = () => {
    // First 2 characters are always UK (for uniqueness/brand)
    const prefix = 'UK';
    
    // Generate remaining characters (4 random alphanumeric)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters like 0,O,1,I
    const length = 4;
    
    const randomPart = Array.from(
      { length }, 
      () => characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
    
    return prefix + randomPart;
  };

  // Generate a new invitation code
  const generateInviteCode = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[useInvitationCode] Generating new invitation code for classroom:", classroomId);
      
      // Generate a unique, readable code
      const invitationToken = generateRandomCode();
      
      // Calculate expiration (90 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);
      
      // Store the invitation code in Supabase
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app', // Marker for general invitations
          invitation_token: invitationToken,
          status: 'pending',
          expires_at: expiresAt.toISOString()
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
      
      return invitation;
    } catch (error: any) {
      console.error("[useInvitationCode] Error generating invitation code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation code",
        variant: "destructive",
      });
      return null;
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
