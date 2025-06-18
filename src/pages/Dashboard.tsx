
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
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { useTutorial } from "@/hooks/useTutorial";
import { useAuth } from "@/hooks/use-auth";

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
  const { userRole: authUserRole, user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  // Use auth hook role if available, otherwise use local state
  useEffect(() => {
    console.log('Dashboard: Auth user role changed:', authUserRole);
    if (authUserRole) {
      setUserRole(authUserRole);
      setLoading(false);
    }
  }, [authUserRole]);

  useEffect(() => {
    console.log('Dashboard: User or role changed:', { user: !!user, authUserRole });
    
    if (!user) {
      console.log('Dashboard: No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (user && !authUserRole) {
      console.log('Dashboard: User exists but no role, checking auth with timeout');
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Dashboard: Role fetch timeout, using fallback');
        setUserRole('student');
        setUserName(user.email || 'User');
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Role Detection Issue",
          description: "Continuing with student access. Contact support if this persists.",
        });
      }, 5000);
      
      checkAuth().finally(() => {
        clearTimeout(timeoutId);
      });
    }
    
    fetchAnnouncements();
  }, [user, authUserRole]);

  const checkAuth = async () => {
    try {
      console.log('Dashboard: Checking authentication');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Dashboard: No session found');
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to access the dashboard"
        });
        navigate('/auth');
        return;
      }

      console.log('Dashboard: Session found, checking role for user:', session.user.id);

      // Check user role with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role query timeout')), 5000)
      );
      
      const rolePromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let data = null;
      let error = null;

      try {
        const result = await Promise.race([rolePromise, timeoutPromise]);
        if (result && typeof result === 'object' && 'data' in result) {
          data = (result as any).data;
          error = (result as any).error;
        }
      } catch (timeoutError) {
        console.error('Dashboard: Role query timed out:', timeoutError);
        error = timeoutError;
      }

      if (error) {
        console.error('Dashboard: Error fetching role:', error);
        // Set fallback role instead of blocking
        setUserRole("student");
        setUserName(session.user.email || "User");
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Role Fetch Error",
          description: "Continuing with student access.",
        });
        return;
      }

      if (!data) {
        console.log('Dashboard: No role found for user, using fallback');
        setUserRole("student");
        setUserName(session.user.email || "User");
        setLoading(false);
        toast({
          title: "Default Role Assigned",
          description: "You've been assigned student access.",
        });
        return;
      }

      console.log('Dashboard: Role found:', data.role);

      // If user is admin, redirect to admin portal
      if (data?.role === 'admin') {
        console.log('Dashboard: Admin user, redirecting to admin portal');
        navigate('/admin-portal');
        return;
      }

      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('full_name')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (teacherData) {
        console.log('Dashboard: Teacher profile found');
        setUserRole('teacher');
        setUserName(teacherData.full_name || session.user.email);
      } else {
        const { data: studentData } = await supabase
          .from('students')
          .select('name')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (studentData) {
          console.log('Dashboard: Student profile found');
          setUserRole('student');
          setUserName(studentData.name || session.user.email);
        } else {
          console.log('Dashboard: No profile found, defaulting to student');
          setUserRole('student');
          setUserName(session.user.email || "User");
        }
      }
    } catch (error) {
      console.error('Dashboard: Error in checkAuth:', error);
      // Always set a role to prevent infinite loading
      setUserRole("student");
      setUserName(user?.email || "User");
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Continuing with limited access.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load announcements"
      });
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

  // Show loading only for a short time
  if (loading && user) {
    console.log('Dashboard: Showing loading state', { loading, user: !!user, userRole });

    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg font-medium text-gray-300">Loading dashboard...</p>
          <p className="text-sm text-gray-400">
            {!user ? 'Checking authentication...' : 'Loading user profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    console.log('Dashboard: No user, returning null');
    return null;
  }

  console.log('Dashboard: Rendering dashboard with role:', userRole);

  return (
    <div className="h-full w-full flex flex-col">
      {TutorialComponent}
      {TutorialPrompt}
      <DashboardHeader userName={userName} />
      
      <div className="flex-1 overflow-y-auto w-full p-6">
        <div className="space-y-6">
          {/* Role-specific dashboard content */}
          {userRole === 'teacher' ? (
            <>
              {/* Teacher Dashboard Components */}
              <TeacherDashboard />
              
              {/* Announcements Section for Teachers */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">Announcements</h2>
                
                {!showAnnouncementForm && (
                  <Button 
                    onClick={() => {
                      console.log('Create Announcement button clicked');
                      setShowAnnouncementForm(true)
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="create-announcement-btn"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                  </Button>
                )}
              </div>

              {showAnnouncementForm && (
                <Card className="p-6 mb-6 border-purple-500/30 bg-black/50">
                  <TeacherAnnouncementForm 
                    onSuccess={handleAnnouncementCreated}
                    onCancel={() => {
                      console.log('Announcement form canceled');
                      setShowAnnouncementForm(false)
                    }}
                  />
                </Card>
              )}

              <AnnouncementList 
                announcements={announcements} 
                loading={loadingAnnouncements} 
                isTeacher={true}
                onAnnouncementDeleted={fetchAnnouncements}
              />
            </>
          ) : (
            <>
              {/* Student Dashboard Components */}
              <StudentDashboard />
              
              {/* Announcements Section for Students */}
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-6">Announcements</h2>
                <AnnouncementList 
                  announcements={announcements} 
                  loading={loadingAnnouncements} 
                  isTeacher={false}
                  onAnnouncementDeleted={fetchAnnouncements}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
