
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import { TutorialStartDialog } from "@/components/tutorial/TutorialStartDialog";
import { useNavigate } from "react-router-dom";

// Create context for tutorial state
type TutorialContextType = {
  showTutorial: boolean;
  showTutorialPrompt: boolean;
  userRole: "teacher" | "student" | null;
  startTutorial: () => void;
  resetTutorialStatus: () => Promise<void>;
  setShowTutorialPrompt: (show: boolean) => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Provider component
export const TutorialProvider = ({ children }: { children: ReactNode }) => {
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

  const value = {
    showTutorial,
    showTutorialPrompt,
    userRole,
    startTutorial,
    resetTutorialStatus,
    setShowTutorialPrompt,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {showTutorial ? (
        <TutorialModal 
          userRole={userRole}
          onClose={() => setShowTutorial(false)} 
        />
      ) : null}
      {showTutorialPrompt ? (
        <TutorialStartDialog
          userRole={userRole}
          isOpen={showTutorialPrompt}
          onOpenChange={setShowTutorialPrompt}
          onStartTutorial={startTutorial}
        />
      ) : null}
    </TutorialContext.Provider>
  );
};

// Hook for using the tutorial context
export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
