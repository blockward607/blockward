
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

      // Find matching invitation or classroom using our simplified service
      const { data: invitationData, error: invitationError } = 
        await ClassJoinService.findInvitation(code);
      
      if (invitationError || !invitationData) {
        console.error("Error finding invitation:", invitationError);
        setError(invitationError?.message || "Invalid class code. Please check and try again.");
        return;
      }
      
      // Determine the classroom to join
      let classroomId, classroomName;
      
      if (invitationData.classroom) {
        // If we matched an invitation with classroom data
        classroomId = invitationData.classroom.id;
        classroomName = invitationData.classroom.name;
      } else if (invitationData.classroom_id) {
        // If we have just the classroom ID from an invitation
        classroomId = invitationData.classroom_id;
        classroomName = "the classroom";
      } else {
        setError("Invalid invitation data");
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
        navigate('/classes');
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
      if (invitationData.id) {
        await ClassJoinService.acceptInvitation(invitationData.id);
      }
      
      // Success!
      console.log("Successfully joined classroom:", classroomName);
      toast({
        title: "Success!",
        description: `You've joined ${classroomName || 'the classroom'}`
      });
      
      // Redirect to classes page
      navigate('/classes');
      
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
