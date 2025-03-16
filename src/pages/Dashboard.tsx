
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import { useTutorial } from "@/hooks/useTutorial";
import type { Classroom } from "@/types/classroom";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { TutorialComponent, TutorialPrompt } = useTutorial();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Partial<Classroom>[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchClassrooms();
    }
  }, [userRole]);

  const checkAuth = async () => {
    try {
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

      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('full_name')
        .eq('user_id', session.user.id)
        .single();
      
      if (teacherData) {
        setUserRole('teacher');
        setUserName(teacherData.full_name || session.user.email);
      } else {
        const { data: studentData } = await supabase
          .from('students')
          .select('name')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentData) {
          setUserRole('student');
          setUserName(studentData.name || session.user.email);
        } else {
          setUserRole('student');
          setUserName(session.user.email);
        }
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      if (userRole === 'teacher') {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
          .single();

        if (teacherProfile) {
          const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setClassrooms(data || []);
          if (data && data.length > 0) {
            setSelectedClassroom(data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg font-medium text-gray-300">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {TutorialComponent}
      {TutorialPrompt}
      <DashboardHeader userName={userName} />
      
      <div className="flex-1 overflow-y-auto w-full">
        {userRole === 'student' ? (
          <StudentDashboard />
        ) : (
          <TeacherDashboard 
            classrooms={classrooms} 
            selectedClassroom={selectedClassroom}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
