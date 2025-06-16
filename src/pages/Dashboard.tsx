
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Loader2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeacherAnnouncementForm } from "@/components/announcements/TeacherAnnouncementForm";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { useTutorial } from "@/hooks/useTutorial";

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  classroom_id?: string | null;
  type?: string;
};

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { TutorialComponent, TutorialPrompt } = useTutorial();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchAnnouncements();
  }, []);

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

      // Try to get user role first with better error handling
      let determinedRole = null;
      let determinedName = session.user.email;

      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roleError) {
          console.error('Role fetch error:', roleError);
        }

        determinedRole = roleData?.[0]?.role || null;

        // Get appropriate profile data based on role
        if (determinedRole === 'admin') {
          const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('full_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          determinedName = adminProfile?.full_name || session.user.email;
        } else if (determinedRole === 'teacher') {
          const { data: teacherData } = await supabase
            .from('teacher_profiles')
            .select('full_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          determinedName = teacherData?.full_name || session.user.email;
        } else if (determinedRole === 'student') {
          const { data: studentData } = await supabase
            .from('students')
            .select('name')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          determinedName = studentData?.name || session.user.email;
        }

        // If no role found, try to determine from profiles
        if (!determinedRole) {
          // Check if user has teacher profile
          const { data: teacherData } = await supabase
            .from('teacher_profiles')
            .select('full_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (teacherData) {
            determinedRole = 'teacher';
            determinedName = teacherData.full_name || session.user.email;
          } else {
            // Check if user has student profile
            const { data: studentData } = await supabase
              .from('students')
              .select('name')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (studentData) {
              determinedRole = 'student';
              determinedName = studentData.name || session.user.email;
            } else {
              // Default fallback
              determinedRole = 'student';
              determinedName = session.user.email;
            }
          }
        }
      } catch (error) {
        console.error('Error determining user role:', error);
        determinedRole = 'student';
        determinedName = session.user.email;
      }

      setUserRole(determinedRole);
      setUserName(determinedName);
    } catch (error) {
      console.error('Error in checkAuth:', error);
      // Continue anyway with fallback values
      setUserRole('student');
      setUserName('User');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAnnouncements([]);
        return;
      }

      // Get user role to determine announcement scope
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const isAdmin = userRoles?.some(r => r.role === 'admin');
      const isTeacher = userRoles?.some(r => r.role === 'teacher');
      const isStudent = userRoles?.some(r => r.role === 'student');

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (isAdmin) {
        // Admin sees all announcements for their school
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('school_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminProfile?.school_id) {
          // Filter announcements by school context (this would need school_id on notifications)
          // For now, get all announcements
        }
      } else if (isTeacher) {
        // Teachers see all announcements (they can create them)
      } else if (isStudent) {
        // Students see announcements for their classrooms or general announcements
        const { data: studentProfile } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (studentProfile) {
          const { data: enrollments } = await supabase
            .from('classroom_students')
            .select('classroom_id')
            .eq('student_id', studentProfile.id);

          const classroomIds = enrollments?.map(e => e.classroom_id) || [];
          
          if (classroomIds.length > 0) {
            query = query.or(`classroom_id.is.null,classroom_id.in.(${classroomIds.join(',')})`);
          } else {
            query = query.is('classroom_id', null);
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load announcements"
      });
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleAnnouncementCreated = () => {
    fetchAnnouncements();
    setShowAnnouncementForm(false);
    toast({
      title: "Success",
      description: "Announcement published successfully"
    });
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold gradient-text">Announcements</h2>
            
            {(userRole === 'teacher' || userRole === 'admin') && !showAnnouncementForm && (
              <Button 
                onClick={() => setShowAnnouncementForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="create-announcement-btn"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            )}
          </div>

          {(userRole === 'teacher' || userRole === 'admin') && showAnnouncementForm && (
            <Card className="p-6 mb-6 border-purple-500/30 bg-black/50">
              <TeacherAnnouncementForm 
                onSuccess={handleAnnouncementCreated}
                onCancel={() => setShowAnnouncementForm(false)}
              />
            </Card>
          )}

          <AnnouncementList 
            announcements={announcements} 
            loading={loadingAnnouncements} 
            isTeacher={userRole === 'teacher' || userRole === 'admin'}
            onAnnouncementDeleted={fetchAnnouncements}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
