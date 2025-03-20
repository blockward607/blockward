
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJoinClassContext } from "./JoinClassContext";
import { useAuth } from "@/hooks/use-auth";

export const useJoinClass = () => {
  const { invitationCode, setInvitationCode, setLoading, setError, loading } = useJoinClassContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoinClass = useCallback(async () => {
    if (!invitationCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }

    if (!user) {
      setError("You must be logged in to join a class");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Joining class with code:", invitationCode);
      
      // First, find the invitation
      const { data: inviteData, error: inviteError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, status')
        .eq('invitation_token', invitationCode.trim())
        .eq('status', 'pending')
        .single();
      
      if (inviteError) {
        console.error("Invite lookup error:", inviteError);
        throw new Error("Invalid invitation code. Please try again.");
      }
      
      if (!inviteData) {
        throw new Error("This invitation code is invalid or has expired.");
      }
      
      console.log("Found invitation:", inviteData);
      
      // Check if student is already enrolled in this class
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('student_enrollments')
        .select('id')
        .eq('classroom_id', inviteData.classroom_id)
        .eq('student_id', user.id)
        .single();
      
      if (existingEnrollment) {
        throw new Error("You are already enrolled in this class.");
      }
      
      // Get student profile, or create if it doesn't exist
      let studentProfileId = null;
      
      const { data: existingProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        studentProfileId = existingProfile.id;
      } else {
        // Create student profile
        const { data: newProfile, error: profileError } = await supabase
          .from('student_profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'Student',
            email: user.email
          })
          .select('id')
          .single();
        
        if (profileError) {
          throw new Error("Failed to create student profile.");
        }
        
        studentProfileId = newProfile.id;
      }
      
      // Enroll the student
      const { error: enrollError } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: studentProfileId,
          classroom_id: inviteData.classroom_id,
          status: 'active',
          invitation_id: inviteData.id
        });
      
      if (enrollError) {
        throw new Error("Failed to enroll in the class. Please try again.");
      }
      
      // Update invitation status
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', inviteData.id);
      
      console.log("Successfully joined class!");
      
      toast({
        title: "Success!",
        description: "You have successfully joined the class.",
      });
      
      // Redirect to class dashboard
      navigate(`/class/${inviteData.classroom_id}`);
    } catch (error: any) {
      console.error("Error joining class:", error);
      setError(error.message || "Failed to join class");
      toast({
        title: "Error",
        description: error.message || "Failed to join class",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [invitationCode, user, setLoading, setError, navigate, toast]);

  return { handleJoinClass };
};
