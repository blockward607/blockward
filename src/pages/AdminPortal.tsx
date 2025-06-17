
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  GraduationCap, 
  School, 
  Settings, 
  BarChart3, 
  LogOut,
  UserPlus,
  Bell,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherManagementPanel } from "@/components/admin/TeacherManagementPanel";
import { StudentManagementPanel } from "@/components/admin/StudentManagementPanel";
import { ClassManagementPanel } from "@/components/admin/ClassManagementPanel";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { TeacherAnnouncementForm } from "@/components/announcements/TeacherAnnouncementForm";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";

interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
}

const AdminPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin-auth');
        return;
      }

      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Admin privileges required"
        });
        navigate('/dashboard');
        return;
      }

      // Get admin profile
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setAdminProfile(adminData);
      await loadStats();
      await loadAnnouncements();

    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin portal"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: teacherCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: classCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalTeachers: teacherCount || 0,
        totalStudents: studentCount || 0,
        totalClasses: classCount || 0
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-lg text-white">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <School className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-400">School Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Welcome, {adminProfile?.full_name || 'Administrator'}
            </span>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="text-gray-300 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="teachers" className="text-white">Teachers</TabsTrigger>
            <TabsTrigger value="students" className="text-white">Students</TabsTrigger>
            <TabsTrigger value="classes" className="text-white">Classes</TabsTrigger>
            <TabsTrigger value="announcements" className="text-white">Announcements</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-200">Teachers</CardTitle>
                    <GraduationCap className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalTeachers}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-200">Students</CardTitle>
                    <Users className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-200">Classes</CardTitle>
                    <School className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalClasses}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full" onClick={() => setActiveTab("teachers")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-blue-500">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            Manage Teachers
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Add, remove and manage teacher accounts
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full" onClick={() => setActiveTab("students")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-green-500">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            Manage Students
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            View and manage student accounts
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full" onClick={() => setActiveTab("classes")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-purple-500">
                          <School className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            Manage Classes
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Create and manage classrooms
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full" onClick={() => setActiveTab("analytics")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-orange-500">
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            View Reports
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            School analytics and reports
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full" onClick={() => setActiveTab("announcements")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-cyan-500">
                          <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            Announcements
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Create school-wide announcements
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full" onClick={() => navigate('/settings')}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-gray-500">
                          <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            School Settings
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Configure school settings
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherManagementPanel />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagementPanel />
          </TabsContent>

          <TabsContent value="classes">
            <ClassManagementPanel />
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">School Announcements</h2>
                  <p className="text-gray-400">Create and manage school-wide announcements</p>
                </div>
                <Button 
                  onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {showAnnouncementForm ? "Cancel" : "New Announcement"}
                </Button>
              </div>

              {showAnnouncementForm && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <TeacherAnnouncementForm
                      onSuccess={() => {
                        setShowAnnouncementForm(false);
                        loadAnnouncements();
                      }}
                      onCancel={() => setShowAnnouncementForm(false)}
                    />
                  </CardContent>
                </Card>
              )}

              <AnnouncementList
                announcements={announcements}
                loading={false}
                isTeacher={true}
                onAnnouncementDeleted={loadAnnouncements}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;
