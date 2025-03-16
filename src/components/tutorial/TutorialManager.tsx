
import { useState, useEffect } from "react";
import { TutorialModal } from "./TutorialModal";
import { supabase } from "@/integrations/supabase/client";

export const TutorialManager = () => {
  const [showTutorial, setShowTutorial] = useState(false);
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

        // If no preferences record or tutorial not completed, show tutorial
        const shouldShowTutorial = !preferences || preferences.tutorial_completed !== true;
        setShowTutorial(shouldShowTutorial);
        setLoading(false);
      } catch (error) {
        console.error("Error checking tutorial status:", error);
        setLoading(false);
      }
    };

    checkTutorialStatus();
  }, []);

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

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
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
    };

    checkUserRole();
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
    setShowTutorialPrompt(false);
  };

  return {
    showTutorial,
    showTutorialPrompt,
    userRole,
    startTutorial,
    setShowTutorialPrompt,
    TutorialComponent: showTutorial ? (
      <TutorialModal 
        userRole={userRole}
        onClose={() => setShowTutorial(false)} 
      />
    ) : null,
    TutorialPrompt: showTutorialPrompt ? (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-black border border-purple-500/30 p-6 rounded-lg max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">Welcome to Blockward!</h3>
          <p className="mb-6">Would you like to take a quick tutorial to learn how to use the platform?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTutorialPrompt(false)}>Skip</Button>
            <Button onClick={startTutorial}>Start Tutorial</Button>
          </div>
        </div>
      </div>
    ) : null
  };
};
