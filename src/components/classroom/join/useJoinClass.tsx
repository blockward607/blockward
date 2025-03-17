
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJoinClassContext } from "./JoinClassContext";
import { AuthService } from "@/services/AuthService";

export const useJoinClass = () => {
  const { toast } = useToast();
  const { 
    invitationCode, 
    setInvitationCode, 
    loading, 
    setLoading,
    setError
  } = useJoinClassContext();

  useEffect(() => {
    // Check for invitation code in URL parameters
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      // Clean and uppercase the code
      const cleanCode = codeParam.trim().toUpperCase();
      setInvitationCode(cleanCode);
      console.log("Found invitation code in URL:", cleanCode);
      // Remove code from URL to prevent accidental reuse
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setInvitationCode]);

  const handleJoinClass = async () => {
    // Reset error state
    setError(null);
    
    // Clean the invitation code
    const cleanCode = invitationCode.trim().toUpperCase();
    
    if (!cleanCode) {
      setError("Please enter an invitation code");
      return;
    }

    console.log("Attempting to join class with code:", cleanCode);
    setLoading(true);

    try {
      // 1. Verify user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to join a class");
        setLoading(false);
        return;
      }
      console.log("User is authenticated:", session.user.id);

      // 2. Validate the invitation code
      console.log("Validating invitation code:", cleanCode);
      const { data: invitationData, error: inviteError } = await supabase
        .from('class_invitations')
        .select('classroom_id, classroom:classrooms(name, teacher_id)')
        .eq('invitation_token', cleanCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (inviteError) {
        console.error("Error validating invitation:", inviteError);
        throw new Error("Could not validate invitation code");
      }
      
      if (!invitationData) {
        setError("The invitation code is invalid or has expired");
        setLoading(false);
        return;
      }
      
      console.log("Found valid invitation:", invitationData);

      // 3. Check if user role exists, and create it if not
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (!userRole) {
        console.log("Creating student role for user");
        const { error: createRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: session.user.id,
            role: 'student'
          });
          
        if (createRoleError) {
          console.error("Error creating user role:", createRoleError);
          throw new Error("Could not create student role");
        }
      }

      // 4. Get or create student profile
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let studentId;
      
      if (existingStudent) {
        console.log("Found existing student profile:", existingStudent);
        studentId = existingStudent.id;
      } else {
        console.log("Creating new student profile");
        // Create the student profile
        const username = session.user.email?.split('@')[0] || 'Student';
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            user_id: session.user.id,
            name: username,
            school: '',
            points: 0
          })
          .select('id')
          .single();
          
        if (createError) {
          console.error("Error creating student profile:", createError);
          throw new Error("Failed to create student profile");
        }
        
        console.log("Created new student profile:", newStudent);
        studentId = newStudent.id;
      }
      
      if (!studentId) {
        throw new Error("Could not get or create student profile");
      }

      // 5. Check if already enrolled
      const { data: existingEnrollment, error: enrollCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', invitationData.classroom_id)
        .eq('student_id', studentId)
        .maybeSingle();

      if (enrollCheckError) {
        console.error("Error checking enrollment:", enrollCheckError);
        throw new Error("Failed to check enrollment status");
      }

      if (existingEnrollment) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this class"
        });
        setLoading(false);
        return;
      }

      // 6. Enroll student in classroom
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        });

      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        throw new Error("Failed to enroll in the classroom");
      }

      // 7. Update invitation status (optional)
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', cleanCode);

      toast({
        title: "Successfully Joined",
        description: `You have joined ${invitationData.classroom?.name || 'the class'}`
      });

      setInvitationCode("");
      
      // 8. Reload page to show updated classes
      setTimeout(() => {
        window.location.href = "/classes";
      }, 1500);
      
    } catch (error: any) {
      console.error('Error joining class:', error);
      setError(error.message || "Failed to join class");
    } finally {
      setLoading(false);
    }
  };

  return { handleJoinClass };
};
