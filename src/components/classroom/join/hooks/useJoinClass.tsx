
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useJoinClassContext } from "../JoinClassContext";
import { ClassJoinService } from "@/services/class-join";
import { StudentProfileService } from "@/services/StudentProfileService";
import { toast } from "sonner";

export const useJoinClass = () => {
  const { invitationCode, setLoading, setError } = useJoinClassContext();
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  // Helper function to ensure student profile and return student ID
  const ensureStudentProfile = async (session: any): Promise<string | null> => {
    try {
      // Check if student profile exists
      const { data: student, error: studentError } = await StudentProfileService.getStudentProfile(session.user.id);
          
      console.log("Student profile check result:", { student, studentError });

      if (student?.id) {
        return student.id;
      }

      // If no student profile, we need to create one and set role
      console.log("Creating student profile for user:", session.user.id);
      
      // Create student profile
      const { data: newStudent, error: createError } = await StudentProfileService.createStudentProfile(
        session.user.id, 
        session.user.email?.split('@')[0] || 'Student'
      );

      if (createError) {
        console.error("Error creating student profile:", createError);
        return null;
      }
      
      console.log("Student profile created:", newStudent);

      // Set user role as student
      const { error: roleError } = await StudentProfileService.setUserRole(session.user.id, 'student');

      if (roleError) {
        console.error("Error setting user role:", roleError);
        return null;
      }

      return newStudent.id;
    } catch (error) {
      console.error("Error in ensureStudentProfile:", error);
      return null;
    }
  };

  const handleJoinClass = useCallback(async () => {
    try {
      // Clear previous errors
      setError(null);
      
      if (isJoining) return;
      
      const code = invitationCode.trim();
      if (!code) {
        setError("Please enter an invitation code");
        return;
      }

      setIsJoining(true);
      setLoading(true);
      console.log("Joining class with code:", code);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fix the toast calls by using sonner toast instead of toast component
        toast.error("Not authenticated. Please log in to join a class");
        
        // Navigate to auth page with intent to join class
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      console.log("User authenticated, checking student profile");
      
      // Check if student profile exists or create one
      const studentId = await ensureStudentProfile(session);
      if (!studentId) {
        setError("Error preparing your student profile. Please try again.");
        return;
      }

      // Try direct database lookup first as it's most reliable
      console.log("Looking for invitation with code:", code);
      const { data: inviteData, error: inviteError } = await supabase
        .from('class_invitations')
        .select('id, invitation_token, classroom_id, expires_at, status, classroom:classrooms(*)')
        .eq('invitation_token', code.toUpperCase())
        .eq('status', 'pending')
        .single();
        
      if (inviteError) {
        console.log("Direct invitation lookup failed:", inviteError.message);
      }
      
      let classroomId, classroomName, invitationId;
      
      if (inviteData) {
        console.log("Found invitation directly:", inviteData);
        classroomId = inviteData.classroom_id;
        classroomName = inviteData.classroom?.name;
        invitationId = inviteData.id;
      } else {
        // If direct lookup fails, try the service for full matching
        console.log("Trying secondary matching methods");
        const { data: matchData, error: matchError } = 
          await ClassJoinService.findClassroomOrInvitation(code);
        
        console.log("Match result:", matchData, matchError);
        
        if (matchError || !matchData) {
          console.error("Error finding classroom or invitation:", matchError);
          setError(matchError?.message || "Invalid code. Please check your code and try again.");
          return;
        }
        
        classroomId = matchData.classroomId;
        classroomName = matchData.classroom?.name || "the classroom";
        invitationId = matchData.invitationId;
      }
      
      if (!classroomId) {
        setError("Could not find a valid classroom with this code.");
        return;
      }
      
      console.log("Found classroom to join:", { classroomId, classroomName });
      
      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentError } = 
        await ClassJoinService.checkEnrollment(classroomId);
      
      if (enrollmentError) {
        console.error("Error checking enrollment:", enrollmentError);
      }
        
      if (existingEnrollment && existingEnrollment.length > 0) {
        console.log("Student already enrolled in this classroom");
        // Fix the toast call
        toast.success("You are already a member of this classroom");
        navigate(`/class/${classroomId}`);
        return;
      }
      
      // Enroll the student
      console.log("Enrolling student in classroom:", { classroomId, studentId, invitationId });
      
      // Direct database insert as fallback
      const { data: enrollData, error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: classroomId,
          student_id: studentId
        })
        .select();
      
      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        setError("Error joining classroom: " + (enrollError.message || "Unknown error"));
        return;
      }

      // If we have an invitation ID, mark it as accepted
      if (invitationId) {
        const { error: updateError } = await supabase
          .from('class_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitationId);
          
        if (updateError) {
          console.error("Error updating invitation status:", updateError);
          // Non-blocking error, continue
        }
      }

      // Success!
      console.log("Successfully joined classroom:", classroomName);
      // Fix the toast call
      toast.success(`You've joined ${classroomName || 'the classroom'}`);
      
      // Redirect to class details page
      navigate(`/class/${classroomId}`);
      
    } catch (error: any) {
      console.error("Error joining class:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  }, [invitationCode, setError, setLoading, isJoining, navigate]);

  return { handleJoinClass };
};
