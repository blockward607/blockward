
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

      // Look up the invitation code in the class_invitations table
      console.log("Looking up invitation code:", invitationCode);
      
      const { data: invitation, error: invitationError } = await supabase
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

      if (!invitation) {
        // Try with case insensitive search
        console.log("No exact match, trying case-insensitive search");
        
        const { data: caseInsensitiveInvitation, error: caseError } = await supabase
          .from('class_invitations')
          .select('*, classroom:classrooms(*)')
          .ilike('invitation_token', invitationCode)
          .eq('status', 'pending')
          .maybeSingle();
          
        if (caseError) {
          console.error("Error in case-insensitive search:", caseError);
          setError("Error verifying invitation code");
          return;
        }
        
        if (!caseInsensitiveInvitation) {
          // If still no match, try using the code as a classroom ID (legacy approach)
          console.log("No invitation found, trying as classroom ID (legacy):", invitationCode);
          
          const { data: classroom, error: classroomError } = await supabase
            .from('classrooms')
            .select('*')
            .eq('id', invitationCode)
            .maybeSingle();
            
          if (classroomError) {
            console.error("Error finding classroom by ID:", classroomError);
          }
          
          if (!classroom) {
            // Try case-insensitive search for classroom ID
            const { data: caseClassroom, error: caseClassError } = await supabase
              .from('classrooms')
              .select('*')
              .ilike('id', invitationCode)
              .maybeSingle();
              
            if (caseClassError || !caseClassroom) {
              console.error("No classroom or invitation found with code:", invitationCode);
              setError("Invalid class code. No matching classroom found.");
              return;
            }
            
            // Use the classroom found by case-insensitive search
            const { data: enrolledClassroom, error: enrollError } = await joinClassroom(studentId, caseClassroom.id);
            
            if (enrollError) {
              console.error("Error enrolling student:", enrollError);
              setError("Error joining classroom");
              return;
            }
            
            handleSuccessfulJoin(caseClassroom.name);
            return;
          }
          
          // Found classroom by ID
          const { data: enrolledClassroom, error: enrollError } = await joinClassroom(studentId, classroom.id);
          
          if (enrollError) {
            console.error("Error enrolling student:", enrollError);
            setError("Error joining classroom");
            return;
          }
          
          handleSuccessfulJoin(classroom.name);
          return;
        }
        
        // Found invitation by case-insensitive search
        invitation = caseInsensitiveInvitation;
      }
      
      // We found a valid invitation, enroll the student
      console.log("Found valid invitation:", invitation);
      
      if (!invitation.classroom) {
        console.error("Invitation doesn't have associated classroom data");
        setError("Invalid invitation code");
        return;
      }
      
      // Enroll student in the classroom
      const { data: enrollment, error: enrollError } = await joinClassroom(studentId, invitation.classroom.id);
      
      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        setError("Error joining classroom");
        return;
      }

      // Update invitation status to 'accepted'
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
      
      handleSuccessfulJoin(invitation.classroom.name);
      
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
