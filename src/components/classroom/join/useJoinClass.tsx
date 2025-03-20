
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJoinClassContext } from "./JoinClassContext";
import { useAuth } from "@/hooks/use-auth";
import { InvitationMatchingService } from "@/services/class-join/InvitationMatchingService";

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
      
      // First, find the classroom or invitation using the InvitationMatchingService
      const { data: matchResult, error: matchError } = await InvitationMatchingService.findClassroomOrInvitation(invitationCode);
      
      if (matchError || !matchResult) {
        console.error("Invitation matching error:", matchError);
        throw new Error(matchError?.message || "Invalid invitation code. Please try again.");
      }
      
      console.log("Found classroom/invitation:", matchResult);
      
      // Get student profile, or create if it doesn't exist
      let studentProfileId = null;
      
      const { data: existingProfile } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingProfile) {
        studentProfileId = existingProfile.id;
      } else {
        // Create student profile
        const { data: newProfile, error: profileError } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.full_name || 'Student'
          })
          .select('id')
          .single();
        
        if (profileError) {
          throw new Error("Failed to create student profile.");
        }
        
        studentProfileId = newProfile.id;
      }
      
      // Check if student is already enrolled in this class
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', matchResult.classroomId)
        .eq('student_id', studentProfileId)
        .maybeSingle();
      
      if (existingEnrollment) {
        throw new Error("You are already enrolled in this class.");
      }
      
      // Enroll the student
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          student_id: studentProfileId,
          classroom_id: matchResult.classroomId
        });
      
      if (enrollError) {
        throw new Error("Failed to enroll in the class. Please try again.");
      }
      
      // If there was an invitation, update its status
      if (matchResult.invitationId) {
        await supabase
          .from('class_invitations')
          .update({ status: 'accepted' })
          .eq('id', matchResult.invitationId);
      }
      
      console.log("Successfully joined class!");
      
      toast({
        title: "Success!",
        description: `You have successfully joined the class${matchResult.classroom?.name ? ': ' + matchResult.classroom.name : ''}.`,
      });
      
      // Redirect to class dashboard
      navigate(`/class/${matchResult.classroomId}`);
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
