
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
      // Clean and uppercase the code
      const cleanCode = codeParam.trim().toUpperCase();
      setInvitationCode(cleanCode);
      console.log("Found invitation code in URL:", cleanCode);
      // Remove code from URL to prevent accidental reuse
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setInvitationCode]);

  const handleJoinClass = async () => {
    // Clean the invitation code
    const cleanCode = invitationCode.trim().toUpperCase();
    
    if (!cleanCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an invitation code"
      });
      return;
    }

    console.log("Attempting to join class with code:", cleanCode);
    setLoading(true);

    try {
      // 1. Verify user is logged in
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
      console.log("User is authenticated:", session.user.id);

      // 2. Validate the invitation code
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
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }
      
      console.log("Found valid invitation:", invitationData);

      // 3. Get or create student profile
      let studentProfile = await getOrCreateStudentProfile(session.user.id, session.user.email || '');
      if (!studentProfile) {
        setLoading(false);
        return;
      }
      
      console.log("Using student profile:", studentProfile);

      // 4. Check if already enrolled
      const { data: existingEnrollment, error: enrollCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', invitationData.classroom_id)
        .eq('student_id', studentProfile.id)
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

      // 5. Enroll student in classroom
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitationData.classroom_id,
          student_id: studentProfile.id
        });

      if (enrollError) {
        console.error("Error enrolling student:", enrollError);
        throw new Error("Failed to enroll in the classroom");
      }

      // 6. Update invitation status (optional)
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', cleanCode);

      toast({
        title: "Successfully Joined",
        description: `You have joined ${invitationData.classroom?.name || 'the class'}`
      });

      setInvitationCode("");
      
      // 7. Reload page to show updated classes
      setTimeout(() => {
        window.location.href = "/classes";
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

  // Helper function to get or create a student profile
  const getOrCreateStudentProfile = async (userId: string, email: string): Promise<{id: string} | null> => {
    try {
      // Check if student profile exists
      const { data: existingStudent, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (studentError && !studentError.message.includes('No rows found')) {
        console.error("Error fetching student profile:", studentError);
        throw new Error("Could not verify student profile");
      }

      if (existingStudent) {
        console.log("Found existing student profile:", existingStudent);
        return existingStudent;
      }

      // If no profile exists, create one
      console.log("No student profile found, creating new one");
      
      // First check if user role exists
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleError && !roleError.message.includes('No rows found')) {
        console.error("Error checking user role:", roleError);
      }
      
      // Create student role if none exists
      if (!userRole) {
        console.log("Creating student role for user");
        const { error: createRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'student'
          });
          
        if (createRoleError) {
          console.error("Error creating user role:", createRoleError);
          throw new Error("Could not create student role");
        }
      }
      
      // Create the student profile
      const username = email.split('@')[0] || 'Student';
      const { data: newStudent, error: createError } = await supabase
        .from('students')
        .insert({
          user_id: userId,
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
      return newStudent;
      
    } catch (error) {
      console.error("Error in getOrCreateStudentProfile:", error);
      toast({
        variant: "destructive", 
        title: "Profile Error",
        description: "Failed to create or verify your student profile"
      });
      return null;
    }
  };

  return { handleJoinClass };
};
