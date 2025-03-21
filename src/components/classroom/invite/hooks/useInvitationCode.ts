
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseInvitationCodeProps {
  classroomId: string;
}

export const useInvitationCode = ({ classroomId }: UseInvitationCodeProps) => {
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const { toast } = useToast();

  // Check for existing invitation code on component mount
  useEffect(() => {
    const checkExistingCode = async () => {
      if (!classroomId) return;
      
      try {
        console.log("[useInvitationCode] Checking for existing invitation code for classroom:", classroomId);
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
        } else {
          console.log("[useInvitationCode] No existing invitation code found for this classroom");
        }
      } catch (error) {
        console.error("[useInvitationCode] Error checking for existing invitation code:", error);
      }
    };
    
    checkExistingCode();
  }, [classroomId]);

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Generate a simple, consistent, alphanumeric code - all uppercase
      const invitationToken = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      if (!classroomId) {
        throw new Error("No classroom ID provided");
      }
      
      console.log("[useInvitationCode] Generating new invitation code for classroom:", classroomId);
      console.log("[useInvitationCode] Generated invitation token:", invitationToken);
      
      // Store the invitation code in Supabase
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app', // Marker for general invitations
          invitation_token: invitationToken, // Already uppercase
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .select()
        .single();
      
      if (inviteError) {
        console.error("[useInvitationCode] Error generating invitation:", inviteError);
        throw new Error(inviteError.message || 'Failed to generate invitation code');
      }
      
      if (!invitation) {
        throw new Error("Failed to create invitation record");
      }
      
      console.log("[useInvitationCode] Invitation created successfully:", invitation);
      setInvitationCode(invitation.invitation_token);
      toast({
        title: "Invitation Link Generated",
        description: "Share this link with your students",
      });
    } catch (error: any) {
      console.error("[useInvitationCode] Error in generateInviteCode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get a join URL for the invitation code
  const getJoinUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${invitationCode}`;
  };

  return {
    loading,
    invitationCode,
    generateInviteCode,
    getJoinUrl
  };
};
