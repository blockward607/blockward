
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import { useTutorial } from "@/hooks/useTutorial";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { TutorialComponent, TutorialPrompt } = useTutorial();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    console.log("Dashboard component mounted");
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we're in demo mode first
      if (window.location.pathname.includes('view-student-dashboard')) {
        setUserRole('student');
        setUserName('Demo Student');
        setLoading(false);
        return;
      } else if (window.location.pathname.includes('view-teacher-dashboard')) {
        setUserRole('teacher');
        setUserName('Demo Teacher');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to access the dashboard"
        });
        navigate('/auth');
        return;
      }

      // Try to get the teacher profile first
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('full_name')
        .eq('user_id', session.user.id)
        .single();
      
      if (teacherProfile) {
        console.log("Found teacher profile:", teacherProfile);
        setUserRole('teacher');
        setUserName(teacherProfile.full_name || session.user.email);
      } else {
        // If not a teacher, check for student profile
        const { data: studentData } = await supabase
          .from('students')
          .select('name')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentData) {
          console.log("Found student profile:", studentData);
          setUserRole('student');
          setUserName(studentData.name || session.user.email);
        } else {
          // Fallback to student if no profile found
          console.log("No profile found, defaulting to student");
          setUserRole('student');
          setUserName(session.user.email);
        }
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg font-medium text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {TutorialComponent}
      {TutorialPrompt}
      <DashboardHeader userName={userName} />
      
      <div className="flex-1 overflow-y-auto w-full p-6">
        {userRole === 'student' ? (
          <StudentDashboard />
        ) : (
          <TeacherDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
