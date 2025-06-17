
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
  UserCog,
  Activity,
  Lock,
  Database,
  Eye,
  Palette,
  Download,
  AlertTriangle,
  Server,
  LifeBuoy,
  Puzzle,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalNFTs: number;
  activeUsers: number;
  systemHealth: string;
}

const AdminPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalNFTs: 0,
    activeUsers: 0,
    systemHealth: 'Good'
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
      // Get basic counts
      const { count: teacherCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: classCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true });

      const { count: nftCount } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalTeachers: teacherCount || 0,
        totalStudents: studentCount || 0,
        totalClasses: classCount || 0,
        totalNFTs: nftCount || 0,
        activeUsers: (teacherCount || 0) + (studentCount || 0),
        systemHealth: 'Good'
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin portal"
      });
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "There was a problem logging out"
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

  const managementSections = [
    {
      title: "User Management",
      description: "Manage students, teachers, and administrators",
      icon: Users,
      features: ["View all users", "Reset passwords", "Suspend accounts", "Assign roles"],
      color: "bg-blue-500",
      action: () => navigate('/admin')
    },
    {
      title: "Class Management", 
      description: "Access and manage all classes",
      icon: School,
      features: ["View all classes", "Reassign teachers", "Set capacity limits", "Archive classes"],
      color: "bg-green-500",
      action: () => navigate('/admin/classes')
    },
    {
      title: "Audit Logs",
      description: "Track user activities and system events", 
      icon: Activity,
      features: ["User activity logs", "Filter by date/user", "Export logs", "Security monitoring"],
      color: "bg-purple-500",
      action: () => toast({ title: "Coming Soon", description: "Audit logs feature will be available soon" })
    },
    {
      title: "Security Settings",
      description: "Network and security configuration",
      icon: Lock,
      features: ["IP whitelisting", "2FA enforcement", "Session management", "Email domain restrictions"],
      color: "bg-red-500",
      action: () => toast({ title: "Coming Soon", description: "Security settings feature will be available soon" })
    },
    {
      title: "File & Data Controls",
      description: "Monitor uploads and data management",
      icon: Database,
      features: ["File monitoring", "Virus scanning", "Data retention", "Backup management"],
      color: "bg-yellow-500",
      action: () => toast({ title: "Coming Soon", description: "File controls feature will be available soon" })
    },
    {
      title: "Access Controls",
      description: "Custom admin roles and permissions",
      icon: Shield,
      features: ["Custom roles", "Granular permissions", "Time-based access", "Activity restrictions"],
      color: "bg-indigo-500",
      action: () => navigate('/admin')
    },
    {
      title: "System Health",
      description: "Monitor server and system performance",
      icon: Server,
      features: ["Server uptime", "Traffic metrics", "Error logs", "Performance monitoring"],
      color: "bg-cyan-500",
      action: () => toast({ title: "Coming Soon", description: "System health dashboard will be available soon" })
    },
    {
      title: "Support Tickets",
      description: "Manage user support requests",
      icon: LifeBuoy,
      features: ["Ticket management", "Assign to staff", "Priority system", "Resolution tracking"],
      color: "bg-orange-500",
      action: () => toast({ title: "Coming Soon", description: "Support ticket system will be available soon" })
    },
    {
      title: "Custom Branding",
      description: "Platform appearance and configuration",
      icon: Palette,
      features: ["Theme customization", "Logo management", "Notifications", "Announcements"],
      color: "bg-pink-500",
      action: () => navigate('/admin/settings')
    },
    {
      title: "Updates & Plugins",
      description: "Feature management and system updates",
      icon: Puzzle,
      features: ["Feature toggles", "Plugin management", "Staging environment", "Update control"],
      color: "bg-teal-500",
      action: () => toast({ title: "Coming Soon", description: "Plugin management will be available soon" })
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-400">System Administration Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-400 border-green-400">
              System Health: {stats.systemHealth}
            </Badge>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">NFTs</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalNFTs}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Administrative Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${section.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white group-hover:text-red-300 transition-colors">
                            {section.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2 mb-4">
                        {section.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={section.action}
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
