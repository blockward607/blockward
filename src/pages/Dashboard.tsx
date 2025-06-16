
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userRole && !error) {
      fetchAnnouncements();
    }
  }, [userRole, error]);

  const checkAuth = async () => {
    try {
      console.log('🔍 Dashboard: Starting auth check...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ Dashboard: No session found, redirecting to auth');
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to access the dashboard"
        });
        navigate('/auth');
        return;
      }

      console.log('✅ Dashboard: Session found for user:', { 
        userId: session.user.id, 
        email: session.user.email,
        metadata: session.user.user_metadata 
      });

      // Try to get user role first with better error handling
      let determinedRole = null;
      let determinedName = session.user.email;

      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roleError) {
          console.error('❌ Dashboard: Role fetch error:', roleError);
          setError(`Failed to fetch user role: ${roleError.message}`);
          setLoading(false);
          return;
        }

        determinedRole = roleData?.[0]?.role || null;
        console.log('📋 Dashboard: User role determined:', determinedRole);

        // Get appropriate profile data based on role
        if (determinedRole === 'admin') {
          console.log('👑 Dashboard: Fetching admin profile...');
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_profiles')
            .select('full_name, school_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (adminError) {
            console.error('❌ Dashboard: Error fetching admin profile:', adminError);
            setError(`Failed to fetch admin profile: ${adminError.message}`);
            setLoading(false);
            return;
          }

          determinedName = adminProfile?.full_name || session.user.email;
          console.log('✅ Dashboard: Admin profile loaded:', { name: determinedName, schoolId: adminProfile?.school_id });
        } else if (determinedRole === 'teacher') {
          console.log('👨‍🏫 Dashboard: Fetching teacher profile...');
          const { data: teacherData, error: teacherError } = await supabase
            .from('teacher_profiles')
            .select('full_name, school_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (teacherError) {
            console.error('❌ Dashboard: Error fetching teacher profile:', teacherError);
            setError(`Failed to fetch teacher profile: ${teacherError.message}`);
            setLoading(false);
            return;
          }

          determinedName = teacherData?.full_name || session.user.email;
          console.log('✅ Dashboard: Teacher profile loaded:', { name: determinedName, schoolId: teacherData?.school_id });
        } else if (determinedRole === 'student') {
          console.log('👨‍🎓 Dashboard: Fetching student profile...');
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('name, school_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (studentError) {
            console.error('❌ Dashboard: Error fetching student profile:', studentError);
            setError(`Failed to fetch student profile: ${studentError.message}`);
            setLoading(false);
            return;
          }

          determinedName = studentData?.name || session.user.email;
          console.log('✅ Dashboard: Student profile loaded:', { name: determinedName, schoolId: studentData?.school_id });
        }

        // If no role found, try to determine from profiles
        if (!determinedRole) {
          console.log('❌ Dashboard: No role found, checking profiles...');
          setError('User role not found. Please contact administrator.');
          setLoading(false);
          return;
        }

        console.log('🎯 Dashboard: Final determined role and name:', { role: determinedRole, name: determinedName });
        setUserRole(determinedRole);
        setUserName(determinedName);
      } catch (profileError) {
        console.error('💥 Dashboard: Error in profile fetching:', profileError);
        const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
        setError(`Error determining user role: ${errorMessage}`);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('💥 Dashboard: Error in checkAuth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Authentication error: ${errorMessage}`);
      setLoading(false);
    } finally {
      if (!error) {
        console.log('🏁 Dashboard: Auth check complete, setting loading to false');
        setLoading(false);
      }
    }
  };

  const fetchAnnouncements = async () => {
    try {
      console.log('🔍 Dashboard: Starting fetchAnnouncements for role:', userRole);
      setLoadingAnnouncements(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('❌ Dashboard: No session for announcements');
        setAnnouncements([]);
        setLoadingAnnouncements(false);
        return;
      }

      // Get user role to determine announcement scope
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (roleError) {
        console.error('❌ Dashboard: Error fetching user roles for announcements:', roleError);
        setAnnouncements([]);
        setLoadingAnnouncements(false);
        return;
      }

      const isAdmin = userRoles?.some(r => r.role === 'admin');
      const isTeacher = userRoles?.some(r => r.role === 'teacher');
      const isStudent = userRoles?.some(r => r.role === 'student');

      console.log('📋 Dashboard: Announcement access levels:', { isAdmin, isTeacher, isStudent });

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (isAdmin || isTeacher) {
        console.log('👑👨‍🏫 Dashboard: Admin/Teacher loading all announcements');
        // Admin and teachers see all announcements for now
      } else if (isStudent) {
        console.log('👨‍🎓 Dashboard: Student loading filtered announcements');
        // Students see announcements for their classrooms or general announcements
        const { data: studentProfile, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (studentError) {
          console.error('❌ Dashboard: Error fetching student profile for announcements:', studentError);
          setAnnouncements([]);
          setLoadingAnnouncements(false);
          return;
        }

        if (studentProfile) {
          const { data: enrollments, error: enrollmentError } = await supabase
            .from('classroom_students')
            .select('classroom_id')
            .eq('student_id', studentProfile.id);

          if (enrollmentError) {
            console.error('❌ Dashboard: Error fetching student enrollments:', enrollmentError);
            setAnnouncements([]);
            setLoadingAnnouncements(false);
            return;
          }

          const classroomIds = enrollments?.map(e => e.classroom_id) || [];
          console.log('🏫 Dashboard: Student classroom IDs:', classroomIds);
          
          if (classroomIds.length > 0) {
            query = query.or(`classroom_id.is.null,classroom_id.in.(${classroomIds.join(',')})`);
          } else {
            query = query.is('classroom_id', null);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Dashboard: Error fetching announcements:', error);
        throw error;
      }
      
      console.log(`✅ Dashboard: Loaded ${data?.length || 0} announcements for role: ${userRole}`);
      setAnnouncements(data || []);
    } catch (error) {
      console.error("💥 Dashboard: Unexpected error fetching announcements:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load announcements: ${errorMessage}`
      });
      setAnnouncements([]);
    } finally {
      console.log('🏁 Dashboard: Setting announcements loading to false');
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

  // Show error state
  if (error) {
    console.log('🚨 Dashboard: Showing error state:', error);
    return (
      <div className="h-full w-full flex flex-col justify-center items-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => {
            console.log('🔄 Dashboard: User clicked retry');
            window.location.reload();
          }} 
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    console.log('⏳ Dashboard: Showing loading state');
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg font-medium text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Dashboard: Rendering main dashboard content');
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
