
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useJoinClassContext } from "./JoinClassContext";

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
      console.log("Joining class with code:", invitationCode);

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

      if (studentError) {
        console.error("Error checking student profile:", studentError);
        setError("Error checking student profile");
        return;
      }

      // If no student profile, we need to create one and set role
      if (!student) {
        console.log("Creating student profile for user:", session.user.id);
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert([{
            user_id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Student'
          }])
          .select('id')
          .single();

        if (createError) {
          console.error("Error creating student profile:", createError);
          setError("Error creating student profile");
          return;
        }

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
        
        console.log("Student profile created:", newStudent);
      }

      // Get classroom by invitation code (first 6 chars of uuid)
      console.log("Looking for classroom with code:", invitationCode);
      const { data: classrooms, error: classroomError } = await supabase
        .from('classrooms')
        .select('*')
        .filter('id', 'ilike', `${invitationCode}%`);

      if (classroomError) {
        console.error("Error fetching classroom:", classroomError);
        setError("Error finding classroom");
        return;
      }

      if (!classrooms || classrooms.length === 0) {
        console.log("No classroom found with code:", invitationCode);
        setError("Invalid invitation code. Please check and try again.");
        return;
      }

      const classroom = classrooms[0];
      console.log("Classroom found:", classroom);

      // Now fetch the student ID again (in case it was just created)
      const { data: studentData, error: fetchError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching student ID:", fetchError);
        setError("Error retrieving student information");
        return;
      }

      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('classroom_students')
        .select('*')
        .eq('classroom_id', classroom.id)
        .eq('student_id', studentData.id)
        .maybeSingle();

      if (enrollmentCheckError) {
        console.error("Error checking enrollment:", enrollmentCheckError);
        setError("Error checking enrollment status");
        return;
      }

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
      console.log("Enrolling student in classroom");
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert([{
          classroom_id: classroom.id,
          student_id: studentData.id
        }]);

      if (enrollError) {
        console.error("Error enrolling in classroom:", enrollError);
        setError("Error joining classroom");
        return;
      }

      // Success
      console.log("Successfully joined classroom");
      toast({
        title: "Success!",
        description: `You've joined ${classroom.name || 'the classroom'}`
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

  return { handleJoinClass };
};
