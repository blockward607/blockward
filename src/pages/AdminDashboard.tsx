import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  GraduationCap, 
  School, 
  FileText, 
  MessageSquare, 
  Coins, 
  Bell, 
  Upload, 
  Shield, 
  Settings, 
  Download,
  TrendingUp,
  BarChart3,
  UserCog
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminQuickStats } from "@/components/admin/AdminQuickStats";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemMonitoring } from "@/components/admin/SystemMonitoring";
import { SecurityControls } from "@/components/admin/SecurityControls";
import { TechnicalSettings } from "@/components/admin/TechnicalSettings";

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  totalAssignments: number;
  nftsMinted: number;
  recentActivity: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    totalAssignments: 0,
    nftsMinted: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuthentication();
    fetchAdminStats();
  }, [user, navigate]);

  const checkAdminAuthentication = async () => {
    if (!user) {
      navigate('/admin-login');
      return;
    }

    try {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!userRole || userRole.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Admin privileges required"
        });
        navigate('/admin-login');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/admin-login');
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      const [studentsRes, teachersRes, classesRes, assignmentsRes, nftsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('teacher_profiles').select('id', { count: 'exact' }),
        supabase.from('classrooms').select('id', { count: 'exact' }),
        supabase.from('assignments').select('id', { count: 'exact' }),
        supabase.from('nfts').select('id', { count: 'exact' })
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        activeClasses: classesRes.count || 0,
        totalAssignments: assignmentsRes.count || 0,
        nftsMinted: nftsRes.count || 0,
        recentActivity: 12
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard statistics"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "Successfully logged out of admin panel"
    });
    navigate('/admin-login');
  };

  const quickStats = [
    { label: "Students", value: stats.totalStudents, icon: GraduationCap, color: "bg-gradient-to-r from-green-500 to-green-600" },
    { label: "Teachers", value: stats.totalTeachers, icon: Users, color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { label: "Classes", value: stats.activeClasses, icon: School, color: "bg-gradient-to-r from-purple-500 to-purple-600" },
    { label: "Assignments", value: stats.totalAssignments, icon: FileText, color: "bg-gradient-to-r from-orange-500 to-orange-600" },
    { label: "NFTs", value: stats.nftsMinted, icon: Coins, color: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
    { label: "Activity", value: stats.recentActivity, icon: TrendingUp, color: "bg-gradient-to-r from-pink-500 to-pink-600" }
  ];

  const adminSections = [
    {
      id: "user-management",
      title: "User Management",
      description: "Manage all users, roles, and account permissions across the platform",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      stats: stats.totalStudents + stats.totalTeachers,
      features: ["Create/Edit/Delete Users", "Role Assignment", "Password Resets", "Account Suspension", "Bulk Actions", "User Analytics"]
    },
    {
      id: "system-monitoring",
      title: "System Monitoring",
      description: "Real-time monitoring of system performance, resources, and health",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      stats: "Live",
      features: ["CPU & Memory Usage", "Database Performance", "Active Sessions", "Response Times", "System Logs", "Alert Management"]
    },
    {
      id: "security-controls",
      title: "Security Controls",
      description: "Advanced security settings, threat monitoring, and access controls",
      icon: Shield,
      color: "from-red-500 to-red-600",
      stats: "Active",
      features: ["2FA Configuration", "IP Whitelisting", "Session Management", "Security Events", "Audit Logs", "Emergency Controls"]
    },
    {
      id: "technical-settings",
      title: "Technical Settings",
      description: "System configuration, database settings, and integration management",
      icon: Settings,
      color: "from-purple-500 to-purple-600",
      stats: "Config",
      features: ["Database Config", "Email Settings", "API Management", "Branding Options", "Backup Settings", "Performance Tuning"]
    },
    {
      id: "teachers",
      title: "Teacher Administration",
      description: "Comprehensive teacher account and permission management",
      icon: GraduationCap,
      color: "from-indigo-500 to-indigo-600",
      stats: stats.totalTeachers,
      features: ["Teacher Profiles", "Class Assignments", "Permission Levels", "Activity Monitoring", "Bulk Operations", "Training Resources"]
    },
    {
      id: "students", 
      title: "Student Administration",
      description: "Student registration, bulk management, and academic oversight",
      icon: UserCog,
      color: "from-cyan-500 to-cyan-600",
      stats: stats.totalStudents,
      features: ["Student Profiles", "Bulk CSV Import", "Class Enrollment", "Progress Tracking", "Parent Communication", "Academic Records"]
    },
    {
      id: "classes",
      title: "Class Management",
      description: "Classroom creation, teacher assignments, and curriculum control",
      icon: School,
      color: "from-teal-500 to-teal-600",
      stats: stats.activeClasses,
      features: ["Create/Edit Classes", "Teacher Assignment", "Student Enrollment", "Resource Management", "Schedule Coordination", "Performance Analytics"]
    },
    {
      id: "assignments",
      title: "Assignment Oversight",
      description: "Platform-wide assignment monitoring and content management",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      stats: stats.totalAssignments,
      features: ["Assignment Templates", "Content Moderation", "Plagiarism Detection", "Grade Analytics", "Due Date Management", "Resource Library"]
    },
    {
      id: "nft-blockchain",
      title: "NFT & Blockchain",
      description: "Blockchain integration, NFT management, and wallet oversight",
      icon: Coins,
      color: "from-yellow-500 to-yellow-600",
      stats: stats.nftsMinted,
      features: ["NFT Templates", "Wallet Management", "Transaction Monitoring", "Blockchain Settings", "Smart Contracts", "Achievement Tracking"]
    },
    {
      id: "communication",
      title: "Communication Hub",
      description: "Platform-wide messaging, announcements, and notification control",
      icon: MessageSquare,
      color: "from-pink-500 to-pink-600",
      stats: "Active",
      features: ["Broadcast Messages", "Emergency Alerts", "Email Integration", "Push Notifications", "Message Moderation", "Communication Logs"]
    },
    {
      id: "analytics-reports",
      title: "Analytics & Reports",
      description: "Comprehensive data analytics, insights, and automated reporting",
      icon: TrendingUp,
      color: "from-violet-500 to-violet-600",
      stats: "Live Data",
      features: ["Usage Analytics", "Performance Reports", "Custom Dashboards", "Data Export", "Trend Analysis", "Predictive Insights"]
    },
    {
      id: "maintenance",
      title: "System Maintenance",
      description: "Database management, backups, updates, and system maintenance",
      icon: Download,
      color: "from-gray-500 to-gray-600",
      stats: "Scheduled",
      features: ["Database Backups", "System Updates", "Cache Management", "Log Rotation", "Performance Optimization", "Health Checks"]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        <AdminHeader onLogout={handleLogout} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AdminQuickStats stats={quickStats} />
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 bg-slate-800/80 p-2 border border-slate-700/50 backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="user-management" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="system-monitoring" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors"
            >
              Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="security-controls" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="technical-settings" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdminStatsCard
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    stats={section.stats}
                    color={section.color}
                    features={section.features}
                    onClick={() => setActiveTab(section.id)}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="user-management" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system-monitoring" className="space-y-6">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="security-controls" className="space-y-6">
            <SecurityControls />
          </TabsContent>

          <TabsContent value="technical-settings" className="space-y-6">
            <TechnicalSettings />
          </TabsContent>

          {/* Existing tabs with enhanced management sections */}
          <TabsContent value="teachers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.filter(section => 
                ['teachers', 'classes', 'assignments'].includes(section.id)
              ).map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdminStatsCard
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    stats={section.stats}
                    color={section.color}
                    features={section.features}
                    onClick={() => console.log(`Navigate to ${section.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.filter(section => 
                ['students', 'analytics-reports', 'communication'].includes(section.id)
              ).map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdminStatsCard
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    stats={section.stats}
                    color={section.color}
                    features={section.features}
                    onClick={() => console.log(`Navigate to ${section.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nft-blockchain" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.filter(section => 
                ['nft-blockchain', 'maintenance', 'communication'].includes(section.id)
              ).map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AdminStatsCard
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    stats={section.stats}
                    color={section.color}
                    features={section.features}
                    onClick={() => console.log(`Navigate to ${section.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <AdminSystemStatus />
      </div>
    </div>
  );
};

export default AdminDashboard;
