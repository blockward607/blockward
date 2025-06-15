
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTutorial } from "@/hooks/useTutorial";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  userName: string | null;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { startTutorial } = useTutorial();
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);

  useEffect(() => {
    const determineUserRole = async () => {
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

    determineUserRole();
  }, []);

  const handleTutorialClick = () => {
    if (userRole) {
      navigate(`/tutorial/${userRole}`);
    } else {
      startTutorial();
    }
  };
  
  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBackClick}
          className="hover:bg-purple-900/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold gradient-text">Announcements</h1>
          <p className="text-gray-400">Welcome back, {userName || 'User'}</p>
        </div>
      </div>
      {/* Removed WalletPanel and Notifications button as per user request */}
    </div>
  );
};

