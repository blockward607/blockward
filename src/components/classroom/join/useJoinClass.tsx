
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useJoinClassContext } from "./JoinClassContext";
import { ClassJoinService } from "@/services/ClassJoinService";
import { findClassroomByPrefix, findClassroomByCaseInsensitive } from "@/utils/classCodeMatcher";
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
      if (!invitationCode.trim()) {
        setError("Please enter an invitation code");
        return;
      }

      setIsJoining(true);
      setLoading(true);
      console.log("Joining class with invitation code:", invitationCode);

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

      // Try to find the classroom using different strategies
      const { classroomForEnrollment, classroomName, matchedInvitation } = 
        await findClassroomWithCode(invitationCode);
      
      // If no classroom found after all attempts, show error
      if (!classroomForEnrollment) {
        console.error("No classroom found with the provided code after all attempts");
        setError("Invalid class code. No matching classroom found.");
        return;
      }
      
      // Enroll student in the classroom
      console.log("Enrolling student in classroom:", { studentId, classroomId: classroomForEnrollment.id });
      const { error: enrollError } = await joinClassroom(studentId, classroomForEnrollment.id);
      
      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        setError("Error joining classroom: " + (enrollError.message || "Unknown error"));
        return;
      }

      // If we used an invitation, update its status
      if (matchedInvitation) {
        await ClassJoinService.acceptInvitation(matchedInvitation.id);
      }
      
      // Success!
      handleSuccessfulJoin(classroomName);
      
    } catch (error: any) {
      console.error("Error joining class:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  };

  // Helper function to ensure student profile and return student ID
  const ensureStudentProfile = async (session: any) => {
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

  // Helper function to find classroom with different matching strategies
  const findClassroomWithCode = async (code: string) => {
    try {
      // Initialize variables to store the results
      let matchedInvitation = null;
      let classroomForEnrollment = null;
      let classroomName = "";

      // Strategy 1: Check for invitation in class_invitations table with exact match
      console.log("Attempting to find invitation by exact token match:", code);
      const { data: exactInvitation, error: invitationError } = await ClassJoinService.getExactInvitation(code);

      if (invitationError) {
        console.error("Error looking up invitation:", invitationError);
        setError("Error verifying invitation code");
        return { classroomForEnrollment: null, classroomName: "", matchedInvitation: null };
      }

      // Set matchedInvitation to exact match if found
      matchedInvitation = exactInvitation;
      
      if (matchedInvitation) {
        console.log("Found invitation by exact match:", matchedInvitation);
      }

      // Strategy 2: If no exact match, try case-insensitive search for invitation
      if (!matchedInvitation) {
        console.log("No exact match, trying case-insensitive search");
        
        const { data: caseInsensitiveInvitation } = await ClassJoinService.getCaseInsensitiveInvitation(code);
          
        if (caseInsensitiveInvitation) {
          console.log("Found invitation through case-insensitive search:", caseInsensitiveInvitation);
          matchedInvitation = caseInsensitiveInvitation;
        }
      }
      
      // Strategy 3: Try directly with classroom ID 
      if (!matchedInvitation) {
        console.log("No invitation found, trying direct classroom ID lookup");
        
        // Try to find a classroom directly by ID
        try {
          // First try exact match with classroom ID
          console.log("Trying exact classroom ID match with:", code);
          const { data: classroom } = await ClassJoinService.getClassroomByExactId(code);
          
          if (classroom) {
            console.log("Found classroom by exact ID match:", classroom);
            classroomForEnrollment = classroom;
            classroomName = classroom.name;
          } else {
            console.log("No exact ID match found");
          }
        } catch (error) {
          console.error("Error in exact ID lookup:", error);
          // Continue to next strategies
        }
        
        // If that fails, try with partial ID matching
        if (!classroomForEnrollment) {
          console.log("Trying with ID prefix/partial matching");
          const { data: allClassrooms } = await ClassJoinService.getAllClassrooms();
          
          if (allClassrooms && allClassrooms.length > 0) {
            // Find classroom where ID starts with the given code
            const prefixMatch = findClassroomByPrefix(allClassrooms, code);
            
            if (prefixMatch) {
              console.log("Found classroom by ID prefix:", prefixMatch);
              classroomForEnrollment = prefixMatch;
              classroomName = prefixMatch.name;
            } else {
              // Try case insensitive match as last resort
              const insensitiveMatch = findClassroomByCaseInsensitive(allClassrooms, code);
              
              if (insensitiveMatch) {
                console.log("Found classroom by case-insensitive ID:", insensitiveMatch);
                classroomForEnrollment = insensitiveMatch;
                classroomName = insensitiveMatch.name;
              }
            }
          }
        }
      }
      
      // If we found a valid invitation, use its classroom
      if (matchedInvitation?.classroom) {
        console.log("Using invitation's classroom for enrollment:", matchedInvitation.classroom);
        classroomForEnrollment = matchedInvitation.classroom;
        classroomName = matchedInvitation.classroom.name;
      }
      
      return { classroomForEnrollment, classroomName, matchedInvitation };
    } catch (error) {
      console.error("Error in findClassroomWithCode:", error);
      return { classroomForEnrollment: null, classroomName: "", matchedInvitation: null };
    }
  };

  // Helper function to check enrollment and join classroom
  const joinClassroom = async (studentId: string, classroomId: string) => {
    try {
      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = 
        await ClassJoinService.checkEnrollment(studentId, classroomId);

      if (enrollmentCheckError) {
        console.error("Error checking enrollment:", enrollmentCheckError);
        throw new Error("Error checking enrollment status");
      }

      if (existingEnrollment) {
        console.log("Student already enrolled in this classroom");
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this classroom"
        });
        navigate('/classes');
        return { data: existingEnrollment, error: null };
      }

      // Enroll the student
      return await ClassJoinService.enrollStudent(studentId, classroomId);
    } catch (error) {
      console.error("Error in joinClassroom:", error);
      return { data: null, error: error };
    }
  };

  // Helper function to handle successful join
  const handleSuccessfulJoin = (classroomName: string) => {
    console.log("Successfully joined classroom:", classroomName);
    toast({
      title: "Success!",
      description: `You've joined ${classroomName || 'the classroom'}`
    });
    
    // Redirect to classes page
    navigate('/classes');
  };

  return { handleJoinClass };
};
