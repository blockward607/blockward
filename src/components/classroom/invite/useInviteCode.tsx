
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInviteCode = (classroomId: string) => {
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string>("");
  const { toast } = useToast();

  // Set the join URL whenever the invitation code changes
  useEffect(() => {
    if (invitationCode) {
      // Create full URL for joining with the code
      const baseUrl = window.location.origin;
      setJoinUrl(`${baseUrl}/dashboard?code=${invitationCode}`);
    } else {
      setJoinUrl("");
    }
  }, [invitationCode]);

  // Fetch existing invite code for this classroom
  useEffect(() => {
    const fetchInviteCode = async () => {
      if (!classroomId) return;
      
      try {
        setLoading(true);
        console.log("Fetching invitation code for classroom:", classroomId);
        
        const { data, error } = await supabase
          .from('class_invitations')
          .select('invitation_token')
          .eq('classroom_id', classroomId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0 && data[0].invitation_token) {
          console.log("Found existing invitation code:", data[0].invitation_token);
          setInvitationCode(data[0].invitation_token);
        } else {
          console.log("No existing invitation code found");
          setInvitationCode("");
        }
      } catch (error: any) {
        console.error("Error fetching invitation code:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInviteCode();
  }, [classroomId]);

  const generateInviteCode = useCallback(async () => {
    if (!classroomId) {
      toast({
        title: "Error",
        description: "Classroom ID is required to generate an invite code",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Generating new invitation code for classroom:", classroomId);
      
      // Generate a random 6-character code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const codeLength = 6;
      const randomCode = Array.from({ length: codeLength }, () => 
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');
      
      console.log("Generated random code:", randomCode);
      
      // Save to database
      const { data, error } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          invitation_token: randomCode,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log("Saved invitation code to database:", data);
      setInvitationCode(randomCode);
      
      toast({
        title: "Success",
        description: "Invitation code generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating invitation code:", error);
      setError(error.message);
      
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [classroomId, toast]);

  return {
    invitationCode,
    loading,
    error,
    generateInviteCode,
    joinUrl,
  };
};
