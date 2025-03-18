
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WalletPanel } from "@/components/wallet/WalletPanel";
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
  
  const handleNotificationsClick = () => {
    navigate('/notifications');
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
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {userName || 'User'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNotificationsClick}
          className="bg-purple-700/20 border-purple-500/30 hover:bg-purple-700/30"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <WalletPanel />
      </div>
    </div>
  );
};
