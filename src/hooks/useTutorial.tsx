
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import { TutorialStartDialog } from "@/components/tutorial/TutorialStartDialog";
import { useNavigate } from "react-router-dom";

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [hasCheckedTutorial, setHasCheckedTutorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setHasCheckedTutorial(true);
          return;
        }

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
        if (!preferences || preferences.tutorial_completed !== true) {
          setShowTutorialPrompt(true);
        }
        
        setHasCheckedTutorial(true);
      } catch (error) {
        console.error("Error checking tutorial status:", error);
        setHasCheckedTutorial(true);
      }
    };

    if (!hasCheckedTutorial) {
      checkTutorialStatus();
    }
  }, [hasCheckedTutorial]);

  const startTutorial = () => {
    if (userRole) {
      navigate(`/tutorial/${userRole}`);
    } else {
      setShowTutorial(true);
    }
    setShowTutorialPrompt(false);
  };

  const skipTutorial = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: session.user.id,
            tutorial_completed: true,
          });
      }
      setShowTutorialPrompt(false);
    } catch (error) {
      console.error("Error saving tutorial preference:", error);
    }
  };

  const resetTutorialStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found");
      }
      
      // Update the user preference to mark tutorial as not completed
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          tutorial_completed: false,
        });
      
      // Navigate to the appropriate tutorial page based on user role
      if (userRole) {
        navigate(`/tutorial/${userRole}`);
        return true;
      } else {
        // If role can't be determined, show the tutorial modal
        setShowTutorial(true);
        return true;
      }
    } catch (error) {
      console.error("Error resetting tutorial status:", error);
      throw error;
    }
  };

  return {
    showTutorial,
    showTutorialPrompt,
    userRole,
    startTutorial,
    skipTutorial,
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
        onSkipTutorial={skipTutorial}
      />
    ) : null
  };
};
