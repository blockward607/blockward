
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useJoinClassContext } from "./JoinClassContext";
import { AuthService } from "@/services/AuthService";

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
      
      // Check if student profile exists
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      console.log("Student profile check result:", { student, studentError });

      let studentId = student?.id;

      // If no student profile, we need to create one and set role
      if (!student) {
        console.log("Creating student profile for user:", session.user.id);
        
        // Create student profile
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert([{
            user_id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Student'
          }])
          .select()
          .single();

        if (createError) {
          console.error("Error creating student profile:", createError);
          setError("Error creating student profile");
          return;
        }
        
        studentId = newStudent.id;
        console.log("Student profile created:", newStudent);

        // Set user role as student
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert([{
            user_id: session.user.id,
            role: 'student'
          }]);

        if (roleError) {
          console.error("Error setting user role:", roleError);
          setError("Error setting user role");
          return;
        }
      }

      // Different search strategies for class codes
      // Strategy 1: Check for invitation in class_invitations table with exact match
      const { data: exactInvitation, error: invitationError } = await supabase
        .from('class_invitations')
        .select('*, classroom:classrooms(*)')
        .eq('invitation_token', invitationCode)
        .eq('status', 'pending')
        .maybeSingle();

      if (invitationError) {
        console.error("Error looking up invitation:", invitationError);
        setError("Error verifying invitation code");
        return;
      }

      // Initialize a variable to store the matched invitation
      let matchedInvitation = exactInvitation;
      let classroomForEnrollment = null;
      let classroomName = "";

      // Strategy 2: If no exact match, try case-insensitive search for invitation
      if (!matchedInvitation) {
        console.log("No exact match, trying case-insensitive search");
        
        const { data: caseInsensitiveInvitation } = await supabase
          .from('class_invitations')
          .select('*, classroom:classrooms(*)')
          .ilike('invitation_token', invitationCode)
          .eq('status', 'pending')
          .maybeSingle();
          
        if (caseInsensitiveInvitation) {
          console.log("Found invitation through case-insensitive search:", caseInsensitiveInvitation);
          matchedInvitation = caseInsensitiveInvitation;
        }
      }
      
      // Strategy 3: Try directly with classroom ID 
      // (This is for classrooms that show the ID directly as in your screenshot)
      if (!matchedInvitation) {
        console.log("Trying direct classroom ID lookup:", invitationCode);
        
        // First try exact match with classroom ID
        let { data: classroom } = await supabase
          .from('classrooms')
          .select('*')
          .eq('id', invitationCode)
          .maybeSingle();
        
        // If that fails, try with just the first part of the ID (6 chars as shown in your UI)
        if (!classroom) {
          console.log("No exact ID match, trying with ID prefix");
          const { data: classroomsByPrefix } = await supabase
            .from('classrooms')
            .select('*');
            
          if (classroomsByPrefix) {
            // Find classroom where ID starts with the given code
            classroom = classroomsByPrefix.find(c => 
              c.id.toLowerCase().startsWith(invitationCode.toLowerCase())
            );
          }
        }
        
        // If still no match, try case insensitive search for classroom ID
        if (!classroom) {
          console.log("Trying case-insensitive classroom ID search");
          const { data: classrooms } = await supabase
            .from('classrooms')
            .select('*');
            
          if (classrooms) {
            // Find matching classroom through case-insensitive comparison
            classroom = classrooms.find(c => 
              c.id.toLowerCase() === invitationCode.toLowerCase() ||
              c.id.toLowerCase().includes(invitationCode.toLowerCase())
            );
          }
        }
          
        if (classroom) {
          console.log("Found classroom by ID (or partial ID):", classroom);
          classroomForEnrollment = classroom;
          classroomName = classroom.name;
        }
      }
      
      // If we found a valid invitation, use its classroom
      if (matchedInvitation?.classroom) {
        console.log("Using invitation's classroom for enrollment");
        classroomForEnrollment = matchedInvitation.classroom;
        classroomName = matchedInvitation.classroom.name;
      }
      
      // If no classroom found after all attempts, show error
      if (!classroomForEnrollment) {
        console.error("No classroom found with the provided code after all attempts");
        setError("Invalid class code. No matching classroom found.");
        return;
      }
      
      // Enroll student in the classroom
      console.log("Enrolling student in classroom:", { studentId, classroomId: classroomForEnrollment.id });
      const { data: enrollment, error: enrollError } = await joinClassroom(studentId, classroomForEnrollment.id);
      
      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        setError("Error joining classroom");
        return;
      }

      // If we used an invitation, update its status
      if (matchedInvitation) {
        await supabase
          .from('class_invitations')
          .update({ status: 'accepted' })
          .eq('id', matchedInvitation.id);
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

  // Helper function to check enrollment and join classroom
  const joinClassroom = async (studentId: string, classroomId: string) => {
    // Check if already enrolled
    console.log("Checking if already enrolled in classroom:", classroomId);
    const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
      .from('classroom_students')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .maybeSingle();

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
    console.log("Enrolling student in classroom:", { studentId, classroomId });
    const { data: enrollmentData, error: enrollError } = await supabase
      .from('classroom_students')
      .insert([{
        classroom_id: classroomId,
        student_id: studentId
      }])
      .select();

    return { data: enrollmentData, error: enrollError };
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
