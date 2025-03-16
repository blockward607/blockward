
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import { TutorialStartDialog } from "@/components/tutorial/TutorialStartDialog";
import { useNavigate } from "react-router-dom";

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTutorialStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Determine user role
      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (teacherData) {
        setUserRole('teacher');
      } else {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentData) {
          setUserRole('student');
        }
      }

      // Check if user has completed tutorial
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('tutorial_completed')
        .eq('user_id', session.user.id)
        .single();

      // If no preferences record or tutorial not completed, show tutorial prompt
      if (!preferences) {
        setShowTutorialPrompt(true);
      }
    };

    checkTutorialStatus();
  }, []);

  const startTutorial = () => {
    if (userRole) {
      navigate(`/tutorial/${userRole}`);
    } else {
      setShowTutorial(true);
    }
    setShowTutorialPrompt(false);
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
    showTutorialPrompt,
    userRole,
    startTutorial,
    resetTutorialStatus,
    setShowTutorialPrompt,
    TutorialComponent: showTutorial ? (
      <TutorialModal 
        userRole={userRole}
        onClose={() => setShowTutorial(false)} 
      />
    ) : null,
    TutorialPrompt: showTutorialPrompt ? (
      <TutorialStartDialog
        userRole={userRole}
        isOpen={showTutorialPrompt}
        onOpenChange={setShowTutorialPrompt}
        onStartTutorial={startTutorial}
      />
    ) : null
  };
};
