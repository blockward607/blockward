
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorialModal } from "@/components/tutorial/TutorialModal";

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);

  useEffect(() => {
    const determineUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if user is a teacher
      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (teacherData) {
        setUserRole('teacher');
        return;
      }
      
      // Check if user is a student
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (studentData) {
        setUserRole('student');
      }
    };

    if (showTutorial) {
      determineUserRole();
    }
  }, [showTutorial]);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const resetTutorialStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          tutorial_completed: false,
        });
      startTutorial();
    }
  };

  return {
    showTutorial,
    startTutorial,
    resetTutorialStatus,
    TutorialComponent: showTutorial ? (
      <TutorialModal 
        userRole={userRole}
        onClose={() => setShowTutorial(false)} 
      />
    ) : null
  };
};
