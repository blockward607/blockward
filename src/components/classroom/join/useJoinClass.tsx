
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useJoinClassContext } from "./JoinClassContext";
import { ClassJoinService } from "@/services/ClassJoinService";
import { StudentProfileService } from "@/services/StudentProfileService";

export const useJoinClass = () => {
  const { invitationCode, setLoading, setError } = useJoinClassContext();
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinClass = async () => {
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
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to join a class"
        });
        navigate('/auth');
        return;
      }

      console.log("User authenticated, checking student profile");
      
      // Check if student profile exists or create one
      const studentId = await ensureStudentProfile(session);
      if (!studentId) {
        setError("Error creating student profile");
        return;
      }

      // Find classroom or invitation using our improved service
      const { data: matchData, error: matchError } = 
        await ClassJoinService.findClassroomOrInvitation(code);
      
      if (matchError || !matchData) {
        console.error("Error finding classroom or invitation:", matchError);
        setError(matchError?.message || "Error finding classroom. Please try again.");
        return;
      }
      
      // Determine the classroom to join
      let classroomId, classroomName, invitationId;
      
      if (matchData.classroom) {
        // If we matched a classroom directly or via an invitation
        classroomId = matchData.classroom.id;
        classroomName = matchData.classroom.name;
        
        // If this came from an invitation, store its ID
        if (matchData.id) {
          invitationId = matchData.id;
        }
      } else if (matchData.classroom_id) {
        // If we have just the classroom ID from an invitation
        classroomId = matchData.classroom_id;
        classroomName = "the classroom";
        invitationId = matchData.id;
      } else {
        setError("Invalid data returned. Please try again.");
        return;
      }
      
      // Check if already enrolled
      const { data: existingEnrollment } = 
        await ClassJoinService.checkEnrollment(studentId, classroomId);
        
      if (existingEnrollment) {
        console.log("Student already enrolled in this classroom");
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this classroom"
        });
        navigate(`/class/${classroomId}`);
        return;
      }
      
      // Enroll the student
      const { error: enrollError } = await ClassJoinService.enrollStudent(studentId, classroomId);
      
      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        setError("Error joining classroom: " + (enrollError.message || "Unknown error"));
        return;
      }

      // If we used an invitation with ID, update its status
      if (invitationId) {
        await ClassJoinService.acceptInvitation(invitationId);
      }
      
      // Success!
      console.log("Successfully joined classroom:", classroomName);
      toast({
        title: "Success!",
        description: `You've joined ${classroomName || 'the classroom'}`
      });
      
      // Redirect to class details page
      navigate(`/class/${classroomId}`);
      
    } catch (error: any) {
      console.error("Error joining class:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  };

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

  return { handleJoinClass };
};
