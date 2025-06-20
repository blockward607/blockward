
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
  Eye,
  ArrowRight
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
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Add Students",
      description: "Invite students to join",
      icon: Users,
      path: "/students",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "New Assignment",
      description: "Create an assignment",
      icon: BookOpen,
      path: "/assignments",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "View Analytics",
      description: "Check class performance",
      icon: TrendingUp,
      path: "/analytics",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    }
  ] : [
    {
      title: "My Classes",
      description: "View enrolled classes",
      icon: BookOpen,
      path: "/classes",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Assignments",
      description: "Check upcoming work",
      icon: Calendar,
      path: "/assignments",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "NFT Wallet",
      description: "View achievements",
      icon: Award,
      path: "/wallet",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Progress",
      description: "Track your learning",
      icon: TrendingUp,
      path: "/progress",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
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

      {/* Quick Actions - Enhanced UI */}
      <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {userRole === 'teacher' ? 'Essential tools for classroom management' : 'Navigate your learning journey'}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {quickActions.length} Actions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isLoading = actionLoading === action.title;
              
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Card className={`h-full ${action.bgColor} ${action.borderColor} border-2 hover:border-opacity-60 transition-all duration-300 cursor-pointer relative overflow-hidden`}>
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Glow effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${action.color} rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    
                    <CardContent className="relative p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div 
                          className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg`}
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <div className="space-y-2 flex-grow">
                        <h3 className="font-bold text-lg text-white group-hover:text-purple-200 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleQuickAction(action.title, action.path)}
                        className={`w-full mt-4 bg-gradient-to-r ${action.color} hover:shadow-lg text-white border-0 font-medium transition-all duration-300 group-hover:shadow-xl`}
                        size="sm"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Open</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
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
