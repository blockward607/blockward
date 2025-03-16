
import { useState, useEffect } from "react";
import { TutorialModal } from "./TutorialModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const TutorialManager = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        // If no preferences record or tutorial not completed, show tutorial
        const shouldShowTutorial = !preferences || preferences.tutorial_completed !== true;
        
        if (shouldShowTutorial && userRole) {
          navigate(`/tutorial/${userRole}`);
        } else {
          setShowTutorial(shouldShowTutorial);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking tutorial status:", error);
        setLoading(false);
      }
    };

    checkTutorialStatus();
  }, [navigate, userRole]);

  if (loading || !showTutorial) {
    return null;
  }

  return (
    <TutorialModal 
      userRole={userRole} 
      onClose={() => setShowTutorial(false)} 
    />
  );
};
