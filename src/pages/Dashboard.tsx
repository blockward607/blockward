
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import type { Classroom } from "@/types/classroom";
import type { Notification } from "@/types/notification";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Partial<Classroom>[]>([]);
  const [notifications, setNotifications] = useState<Partial<Notification>[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchClassrooms();
      fetchNotifications();
    }
  }, [userRole]);

  const checkAuth = async () => {
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

    // Get user role from teacher_profiles or students table directly
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
        // If no role is found, default to student
        setUserRole('student');
        setUserName(session.user.email);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      });
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
      <div className="flex items-center justify-center h-screen">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader userName={userName} />
        <NotificationsPanel notifications={notifications} />
        
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
