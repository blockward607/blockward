
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
  UserMinus,
  BookOpen,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0
  });

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

  const quickActions = [
    {
      title: "Manage Teachers",
      description: "Add, remove and manage teacher accounts",
      icon: GraduationCap,
      action: () => toast({ title: "Teachers", description: "Teacher management coming soon" }),
      color: "bg-blue-500"
    },
    {
      title: "Manage Students", 
      description: "View and manage student accounts",
      icon: Users,
      action: () => toast({ title: "Students", description: "Student management coming soon" }),
      color: "bg-green-500"
    },
    {
      title: "Manage Classes",
      description: "Create and manage classrooms",
      icon: School,
      action: () => toast({ title: "Classes", description: "Class management coming soon" }),
      color: "bg-purple-500"
    },
    {
      title: "View Reports",
      description: "School analytics and reports",
      icon: BarChart3,
      action: () => toast({ title: "Reports", description: "Analytics coming soon" }),
      color: "bg-orange-500"
    },
    {
      title: "School Settings",
      description: "Configure school settings",
      icon: Settings,
      action: () => navigate('/settings'),
      color: "bg-gray-500"
    },
    {
      title: "Add Teacher",
      description: "Invite new teachers",
      icon: UserPlus,
      action: () => toast({ title: "Add Teacher", description: "Teacher invitation coming soon" }),
      color: "bg-indigo-500"
    }
  ];

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
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
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
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            {action.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {action.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={action.action}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        Access
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
