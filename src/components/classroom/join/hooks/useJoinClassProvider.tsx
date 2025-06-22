
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JoinClassContextType {
  isJoining: boolean;
  joinClass: (code: string) => Promise<void>;
}

const JoinClassContext = createContext<JoinClassContextType | undefined>(undefined);

export const useJoinClass = () => {
  const context = useContext(JoinClassContext);
  if (!context) {
    throw new Error('useJoinClass must be used within a JoinClassProvider');
  }
  return context;
};

interface JoinClassProviderProps {
  children: ReactNode;
}

export const JoinClassProvider: React.FC<JoinClassProviderProps> = ({ children }) => {
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const joinClass = async (code: string) => {
    setIsJoining(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to join a class"
        });
        return;
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
        // For now, let's use the default school or create one
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
      } else {
        throw new Error(joinResult?.error || 'Failed to join classroom');
      }
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Failed to join class",
        description: error.message || "Please check the code and try again"
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <JoinClassContext.Provider value={{ isJoining, joinClass }}>
      {children}
    </JoinClassContext.Provider>
  );
};
