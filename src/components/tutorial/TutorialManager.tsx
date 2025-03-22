
import { useState, useEffect } from "react";
import { TutorialModal } from "./TutorialModal";
import { supabase } from "@/integrations/supabase/client";
import { TutorialStartDialog } from "./TutorialStartDialog";

export const TutorialManager = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        // Get user role
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
        if (!preferences || preferences.tutorial_completed !== true) {
          setShowPrompt(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking tutorial status:", error);
        setLoading(false);
      }
    };

    checkTutorialStatus();
  }, []);

  const handleStartTutorial = () => {
    setShowPrompt(false);
    setShowTutorial(true);
  };

  const handleResetTutorial = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          tutorial_completed: false,
        });
      setShowTutorial(true);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {showPrompt && (
        <TutorialStartDialog
          userRole={userRole}
          isOpen={showPrompt}
          onOpenChange={setShowPrompt}
          onStartTutorial={handleStartTutorial}
        />
      )}
      
      {showTutorial && (
        <TutorialModal 
          userRole={userRole} 
          onClose={() => setShowTutorial(false)} 
        />
      )}
    </>
  );
};

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  return {
    showTutorial,
    startTutorial,
    TutorialComponent: showTutorial ? (
      <TutorialModal 
        userRole={null} // Will be determined inside modal
        onClose={() => setShowTutorial(false)} 
      />
    ) : null
  };
};
