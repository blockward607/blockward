
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InvitationService } from "@/services/InvitationService";

export const useInviteCode = (classroomId: string) => {
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const { toast } = useToast();

  // Fetch existing invitation code on component mount
  useEffect(() => {
    const checkExistingCode = async () => {
      if (!classroomId) return;
      
      try {
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
          setInvitationCode(data[0].invitation_token);
        }
      } catch (error) {
        console.error("Error checking for existing invitation code:", error);
      }
    };
    
    checkExistingCode();
  }, [classroomId]);

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      console.log("Generating new invitation code for classroom:", classroomId);
      
      // Use the InvitationService to generate and store the code
      const { data, error } = await InvitationService.createClassInvitation(classroomId);
      
      if (error) {
        throw new Error(error.message || 'Failed to generate invitation code');
      }
      
      console.log("Invitation created successfully:", data);
      setInvitationCode(data.invitation_token);
      toast({
        title: "Invitation Code Generated",
        description: "Share this code with your students",
      });
    } catch (error: any) {
      console.error("Error in generateInviteCode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a URL that will automatically apply the code when clicked
  const joinUrl = `${window.location.origin}/classes?code=${invitationCode}`;

  return {
    loading,
    invitationCode,
    generateInviteCode,
    joinUrl
  };
};
