
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJoinClassContext } from "./JoinClassContext";

export const useJoinClass = () => {
  const { toast } = useToast();
  const { invitationCode, setInvitationCode, loading, setLoading } = useJoinClassContext();

  useEffect(() => {
    // Check for invitation code in URL parameters
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setInvitationCode(codeParam);
      console.log("Found invitation code in URL:", codeParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setInvitationCode]);

  const handleJoinClass = async () => {
    if (!invitationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an invitation code"
      });
      return;
    }

    // Clean the invitation code (remove whitespace, etc.)
    const cleanCode = invitationCode.trim().toUpperCase();
    console.log("Attempting to join class with code:", cleanCode);

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to join a class"
        });
        setLoading(false);
        return;
      }

      // Get invitation details
      const { data: invitationData, error: validationError } = await supabase
        .from('class_invitations')
        .select('classroom_id, classroom:classrooms(name)')
        .eq('invitation_token', cleanCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (validationError) {
        console.error("Invitation validation error:", validationError);
        throw new Error(validationError.message);
      }
      
      if (!invitationData) {
        console.error("No invitation found with code:", cleanCode);
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }

      console.log("Found valid invitation:", invitationData);

      // Check or create student profile
      let studentId;
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (studentError) {
        console.error("Error fetching student profile:", studentError);
        throw new Error(studentError.message);
      }

      if (!studentData) {
        // Create new student profile if it doesn't exist
        const username = session.user.email?.split('@')[0] || 'Student';
        console.log("Creating new student profile for user:", session.user.id, "with name:", username);
        
        // Check user role first
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        // If no role, create one as student
        if (!roleData) {
          console.log("Creating student role for user:", session.user.id);
          await supabase
            .from('user_roles')
            .insert({
              user_id: session.user.id,
              role: 'student'
            });
        }
        
        // Now create student profile
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            user_id: session.user.id,
            name: username,
            school: ''
          })
          .select('id')
          .single();
          
        if (createError) {
          console.error("Error creating student profile:", createError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create student profile: " + createError.message
          });
          setLoading(false);
          return;
        }
        
        console.log("Created new student profile:", newStudent);
        studentId = newStudent.id;
      } else {
        studentId = studentData.id;
        console.log("Using existing student profile:", studentId);
      }

      // Check if student is already enrolled in this classroom
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .match({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        })
        .maybeSingle();

      if (enrollmentCheckError) {
        console.error("Error checking enrollment:", enrollmentCheckError);
        throw new Error(enrollmentCheckError.message);
      }

      if (existingEnrollment) {
        toast({
          variant: "default",
          title: "Already Enrolled",
          description: "You are already enrolled in this class"
        });
        setLoading(false);
        return;
      }

      // Enroll student in the classroom
      console.log("Enrolling student in classroom:", {
        classroom_id: invitationData.classroom_id,
        student_id: studentId
      });
      
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        });

      if (enrollError) {
        console.error("Enrollment error:", enrollError);
        throw new Error("Failed to enroll in the classroom: " + enrollError.message);
      }

      console.log("Successfully enrolled in classroom");

      // Update invitation status
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', cleanCode);

      toast({
        title: "Success",
        description: `You have successfully joined ${invitationData.classroom?.name || 'the class'}`
      });

      setInvitationCode("");
      
      // Reload page after short delay to show updated classes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join class"
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleJoinClass };
};
