
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
  Mail, 
  Award,
  Calendar,
  FileText,
  Shield,
  Home,
  UserCog
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherManagement } from "@/components/admin/TeacherManagement";
import { HomeroomManagement } from "@/components/admin/HomeroomManagement";
import { AccessLevelManagement } from "@/components/admin/AccessLevelManagement";

interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalNFTs: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalNFTs: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
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
          description: "You don't have admin privileges"
        });
        navigate('/dashboard');
        return;
      }

      // Get admin profile and school
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select(`
          *,
          schools (*)
        `)
        .eq('user_id', session.user.id)
        .single();

      if (adminData) {
        setAdminProfile(adminData);
        setSchool(adminData.schools);
        await loadStats(adminData.school_id);
      }

    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin dashboard"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (schoolId: string) => {
    try {
      // Get teacher count
      const { count: teacherCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      // Get student count  
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      // Get classroom count
      const { count: classCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true });

      // Get NFT count
      const { count: nftCount } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalTeachers: teacherCount || 0,
        totalStudents: studentCount || 0,
        totalClasses: classCount || 0,
        totalNFTs: nftCount || 0
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Send Announcements",
      description: "Broadcast messages to users",
      icon: Mail,
      action: () => navigate('/admin/announcements'),
      color: "bg-orange-500"
    },
    {
      title: "View Analytics",
      description: "School performance metrics",
      icon: BarChart3,
      action: () => navigate('/admin/analytics'),
      color: "bg-indigo-500"
    },
    {
      title: "Manage Rewards",
      description: "Configure NFTs and rewards",
      icon: Award,
      action: () => navigate('/admin/rewards'),
      color: "bg-yellow-500"
    },
    {
      title: "School Settings",
      description: "Configure school information",
      icon: Settings,
      action: () => navigate('/school-setup'),
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Welcome back, {adminProfile?.full_name || 'Administrator'}
          </p>
          {school && (
            <p className="text-lg text-gray-400">
              Managing {school.name} | Access Level: {adminProfile?.access_level?.replace('_', ' ')}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Students</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total Classes</CardTitle>
              <School className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalClasses}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total NFTs</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalNFTs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="teachers" className="text-white">Teachers</TabsTrigger>
            <TabsTrigger value="homerooms" className="text-white">Homerooms</TabsTrigger>
            <TabsTrigger value="access" className="text-white">Access Levels</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg ${action.color}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
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
                            className="w-full bg-purple-600 hover:bg-purple-700"
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
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherManagement />
          </TabsContent>

          <TabsContent value="homerooms">
            <HomeroomManagement />
          </TabsContent>

          <TabsContent value="access">
            <AccessLevelManagement />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
