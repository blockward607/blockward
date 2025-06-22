
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useJoinClassroomCode = () => {
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const joinWithCode = async (code: string) => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a classroom code"
      });
      return false;
    }

    setIsJoining(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to join a classroom"
        });
        return false;
      }

      // Get or create student profile with school_id
      let { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, school_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (studentError && studentError.code !== 'PGRST116') {
        throw studentError;
      }

      if (!student) {
        // If no student exists, we need to get school_id from somewhere
        // For now, let's use the default school
        const { data: defaultSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('institution_code', 'LEGACY')
          .single();

        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            user_id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
            school_id: defaultSchool?.id || null
          })
          .select('id, school_id')
          .single();

        if (createError) throw createError;
        student = newStudent;
      }

      // Join classroom using code
      const { data: result, error: joinError } = await supabase
        .rpc('join_classroom_with_code', {
          p_code: code.toUpperCase(),
          p_student_id: student.id
        });

      if (joinError) throw joinError;

      const joinResult = result as { success?: boolean; error?: string; classroom_name?: string } | null;

      if (joinResult?.success) {
        toast({
          title: "Success!",
          description: `Successfully joined ${joinResult.classroom_name || 'classroom'}`
        });
        return true;
      } else {
        throw new Error(joinResult?.error || 'Failed to join classroom');
      }
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      toast({
        variant: "destructive",
        title: "Failed to join classroom",
        description: error.message || "Please check the code and try again"
      });
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    joinWithCode,
    isJoining
  };
};
