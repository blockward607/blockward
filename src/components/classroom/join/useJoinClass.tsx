
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
      
      if (validationError || !invitationData) {
        console.error("Invitation validation error:", validationError);
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }

      // Check or create student profile
      let studentId;
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (studentError || !studentData) {
        // Create new student profile if it doesn't exist
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
          
        if (createError || !newStudent) {
          console.error("Error creating student profile:", createError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create student profile"
          });
          setLoading(false);
          return;
        }
        
        studentId = newStudent.id;
        
        // Also create user role as student if it doesn't exist
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (!existingRole) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: session.user.id,
              role: 'student'
            });
        }
      } else {
        studentId = studentData.id;
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
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        });

      if (enrollError) {
        console.error("Enrollment error:", enrollError);
        throw new Error("Failed to enroll in the classroom");
      }

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
