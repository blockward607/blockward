import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp, 
  Bell,
  Plus,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminControlPanel } from "@/components/admin/AdminControlPanel";

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalAssignments: number;
  totalNFTs: number;
  recentActivity: any[];
  notifications: any[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalClasses: 0,
    totalAssignments: 0,
    totalNFTs: 0,
    recentActivity: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role || 'student';
      setUserRole(role);

      // Redirect admin users to admin dashboard
      if (role === 'admin') {
        navigate('/admin');
        return;
      }

      // Load stats based on role
      if (role === 'teacher') {
        await loadTeacherStats(session.user.id);
      } else {
        await loadStudentStats(session.user.id);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherStats = async (userId: string) => {
    try {
      // Get teacher profile
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!teacherProfile) return;

      // Load teacher's classrooms
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select(`
          id,
          name,
          classroom_students(count)
        `)
        .eq('teacher_id', teacherProfile.id);

      // Load assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .in('classroom_id', classrooms?.map(c => c.id) || []);

      // Load recent notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .in('classroom_id', classrooms?.map(c => c.id) || [])
        .order('created_at', { ascending: false })
        .limit(5);

      const totalStudents = classrooms?.reduce((sum, c) => sum + (c.classroom_students?.length || 0), 0) || 0;

      setStats({
        totalStudents,
        totalClasses: classrooms?.length || 0,
        totalAssignments: assignments?.length || 0,
        totalNFTs: 0,
        recentActivity: [],
        notifications: notifications || []
      });

    } catch (error) {
      console.error('Error loading teacher stats:', error);
    }
  };

  const loadStudentStats = async (userId: string) => {
    try {
      // Get student profile
      const { data: student } = await supabase
        .from('students')
        .select('id, points')
        .eq('user_id', userId)
        .single();

      if (!student) return;

      // Load student's classes
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select(`
          classroom_id,
          classrooms(name, description)
        `)
        .eq('student_id', student.id);

      // Load student's assignments
      const classroomIds = enrollments?.map(e => e.classroom_id) || [];
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .in('classroom_id', classroomIds)
        .order('due_date', { ascending: true })
        .limit(5);

      // Load student's NFTs
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

      let nftCount = 0;
      if (wallet) {
        const { data: nfts } = await supabase
          .from('nfts')
          .select('id')
          .eq('owner_wallet_id', wallet.id);
        nftCount = nfts?.length || 0;
      }

      setStats({
        totalStudents: 0,
        totalClasses: enrollments?.length || 0,
        totalAssignments: assignments?.length || 0,
        totalNFTs: nftCount,
        recentActivity: assignments || [],
        notifications: []
      });

    } catch (error) {
      console.error('Error loading student stats:', error);
    }
  };

  const handleQuickAction = async (actionTitle: string, actionPath: string) => {
    console.log(`🔥 Quick action clicked: ${actionTitle} -> ${actionPath}`);
    
    if (actionLoading) {
      console.log('⚠️ Action already in progress, ignoring click');
      return;
    }

    try {
      setActionLoading(actionTitle);
      
      // Map routes to ensure they exist
      let targetRoute = actionPath;
      
      switch (actionPath) {
        case "/progress":
          // Redirect to dashboard since progress page doesn't exist yet
          targetRoute = "/dashboard";
          toast({
            title: "Coming Soon",
            description: "Progress tracking is coming soon!"
          });
          break;
        case "/analytics":
          // Redirect to dashboard since analytics page doesn't exist yet
          targetRoute = "/dashboard";
          toast({
            title: "Coming Soon", 
            description: "Analytics page is coming soon!"
          });
          break;
        default:
          // Keep the original route for existing pages
          targetRoute = actionPath;
      }
      
      console.log(`✅ Navigating to: ${targetRoute}`);
      
      toast({
        title: "Navigation",
        description: `Opening ${actionTitle}...`
      });
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));
      
      navigate(targetRoute);
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: `Failed to open ${actionTitle}. Please try again.`
      });
    } finally {
      setTimeout(() => setActionLoading(null), 500);
    }
  };

  const quickActions = userRole === 'teacher' ? [
    {
      title: "Create Class",
      description: "Start a new classroom",
      icon: Plus,
      path: "/classes",
      color: "bg-blue-500"
    },
    {
      title: "Add Students",
      description: "Invite students to join",
      icon: Users,
      path: "/students",
      color: "bg-green-500"
    },
    {
      title: "New Assignment",
      description: "Create an assignment",
      icon: BookOpen,
      path: "/assignments",
      color: "bg-purple-500"
    },
    {
      title: "View Analytics",
      description: "Check class performance",
      icon: TrendingUp,
      path: "/analytics",
      color: "bg-orange-500"
    }
  ] : [
    {
      title: "My Classes",
      description: "View enrolled classes",
      icon: BookOpen,
      path: "/classes",
      color: "bg-blue-500"
    },
    {
      title: "Assignments",
      description: "Check upcoming work",
      icon: Calendar,
      path: "/assignments",
      color: "bg-green-500"
    },
    {
      title: "NFT Wallet",
      description: "View achievements",
      icon: Award,
      path: "/wallet",
      color: "bg-purple-500"
    },
    {
      title: "Progress",
      description: "Track your learning",
      icon: TrendingUp,
      path: "/progress",
      color: "bg-orange-500"
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-white">
          Welcome to BlockWard
        </h1>
        <p className="text-xl text-gray-400">
          {userRole === 'teacher' ? 'Manage your classroom and inspire students' : 'Continue your learning journey'}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {userRole === 'teacher' ? 'Students' : 'Classes'}
                </p>
                <p className="text-3xl font-bold text-white">
                  {userRole === 'teacher' ? stats.totalStudents : stats.totalClasses}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {userRole === 'teacher' ? 'Classes' : 'Assignments'}
                </p>
                <p className="text-3xl font-bold text-white">
                  {userRole === 'teacher' ? stats.totalClasses : stats.totalAssignments}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {userRole === 'teacher' ? 'Assignments' : 'NFTs Earned'}
                </p>
                <p className="text-3xl font-bold text-white">
                  {userRole === 'teacher' ? stats.totalAssignments : stats.totalNFTs}
                </p>
              </div>
              {userRole === 'teacher' ? (
                <Calendar className="h-8 w-8 text-purple-400" />
              ) : (
                <Award className="h-8 w-8 text-purple-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Notifications</p>
                <p className="text-3xl font-bold text-white">{stats.notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Admin Panel */}
      {userRole === 'teacher' && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Teacher Controls
            </CardTitle>
            <CardDescription>
              Quick access to administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminControlPanel />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isLoading = actionLoading === action.title;
              
              return (
                <Button
                  key={action.title}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickAction(action.title, action.path)}
                  className="h-auto p-4 flex flex-col items-center gap-3 bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600 cursor-pointer transition-all duration-200 hover:scale-105"
                >
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      {isLoading ? 'Loading...' : action.title}
                    </p>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'No due date'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
