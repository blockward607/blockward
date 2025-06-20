
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
  UserCog,
  Eye,
  Lock,
  AlertTriangle,
  Database,
  Palette
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
import { TeacherManagement } from "@/components/admin/TeacherManagement";
import { StudentManagement } from "@/components/admin/StudentManagement";
import { ClassManagement } from "@/components/admin/ClassManagement";
import { AssignmentControl } from "@/components/admin/AssignmentControl";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { NFTTracker } from "@/components/admin/NFTTracker";
import { UploadCenter } from "@/components/admin/UploadCenter";
import { NotificationSystem } from "@/components/admin/NotificationSystem";
import { BackupExport } from "@/components/admin/BackupExport";
import { AccessLogs } from "@/components/admin/AccessLogs";
import { SiteSettings } from "@/components/admin/SiteSettings";

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  totalAssignments: number;
  nftsMinted: number;
  recentActivity: number;
  assignmentCompletionRate: number;
  activeUsers: number;
  nftUsageCount: number;
  pendingReports: number;
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
    recentActivity: 0,
    assignmentCompletionRate: 0,
    activeUsers: 0,
    nftUsageCount: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard: Starting initialization');
    
    const initializeDashboard = async () => {
      try {
        const isAuthorized = await checkAdminAuthentication();
        if (isAuthorized) {
          await fetchAdminStats();
        }
      } catch (error) {
        console.error('AdminDashboard: Initialization error:', error);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, navigate]);

  const checkAdminAuthentication = async (): Promise<boolean> => {
    console.log('AdminDashboard: Checking admin authentication for user:', user?.id);
    
    if (!user) {
      console.log('AdminDashboard: No user found, redirecting to admin login');
      navigate('/admin-login');
      return false;
    }

    try {
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('AdminDashboard: Error fetching user role:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to verify admin privileges. Contact support if this continues."
        });
        navigate('/admin-login');
        return false;
      }

      if (!userRole || userRole.role !== 'admin') {
        console.log('AdminDashboard: User is not admin, attempting to promote...');
        
        try {
          const { error: promoteError } = await supabase.rpc('promote_user_to_admin', {
            target_user_id: user.id,
            admin_name: user.email?.split('@')[0] || 'Administrator',
            admin_position: 'System Administrator'
          });

          if (!promoteError) {
            console.log('AdminDashboard: Successfully promoted user to admin');
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the admin dashboard!"
            });
            return true;
          }
        } catch (promoteError) {
          console.error('AdminDashboard: Failed to promote user:', promoteError);
        }
        
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Admin privileges required to access this dashboard"
        });
        navigate('/admin-login');
        return false;
      }

      console.log('AdminDashboard: Admin authentication successful');
      return true;
    } catch (error) {
      console.error('AdminDashboard: Admin auth check error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authentication check failed. Please try refreshing the page."
      });
      navigate('/admin-login');
      return false;
    }
  };

  const fetchAdminStats = async () => {
    console.log('AdminDashboard: Fetching comprehensive admin statistics');
    
    try {
      const results = await Promise.allSettled([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('teacher_profiles').select('id', { count: 'exact' }),
        supabase.from('classrooms').select('id', { count: 'exact' }),
        supabase.from('assignments').select('id', { count: 'exact' }),
        supabase.from('nfts').select('id', { count: 'exact' }),
        supabase.from('grades').select('id', { count: 'exact' }),
        supabase.from('classroom_codes').select('usage_count').eq('is_active', true),
        supabase.from('behavior_records').select('id', { count: 'exact' }).eq('resolved', false)
      ]);

      console.log('AdminDashboard: Comprehensive query results:', results);

      const studentsCount = results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0;
      const teachersCount = results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0;
      const classesCount = results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0;
      const assignmentsCount = results[3].status === 'fulfilled' ? results[3].value.count || 0 : 0;
      const nftsCount = results[4].status === 'fulfilled' ? results[4].value.count || 0 : 0;
      const gradesCount = results[5].status === 'fulfilled' ? results[5].value.count || 0 : 0;
      const codeUsage = results[6].status === 'fulfilled' ? 
        (results[6].value.data || []).reduce((sum, code) => sum + (code.usage_count || 0), 0) : 0;
      const pendingReports = results[7].status === 'fulfilled' ? results[7].value.count || 0 : 0;

      const completionRate = assignmentsCount > 0 ? Math.round((gradesCount / assignmentsCount) * 100) : 0;

      setStats({
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        activeClasses: classesCount,
        totalAssignments: assignmentsCount,
        nftsMinted: nftsCount,
        recentActivity: studentsCount + teachersCount,
        assignmentCompletionRate: completionRate,
        activeUsers: studentsCount + teachersCount,
        nftUsageCount: codeUsage,
        pendingReports: pendingReports
      });

      console.log('AdminDashboard: Comprehensive stats updated successfully');
    } catch (error) {
      console.error('AdminDashboard: Error fetching comprehensive stats:', error);
      console.log('AdminDashboard: Using fallback stats due to fetch error');
    }
  };

  const handleLogout = async () => {
    console.log('AdminDashboard: Logging out');
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
    { label: "NFTs Minted", value: stats.nftsMinted, icon: Coins, color: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
    { label: "Completion Rate", value: `${stats.assignmentCompletionRate}%`, icon: TrendingUp, color: "bg-gradient-to-r from-pink-500 to-pink-600" }
  ];

  const adminSections = [
    {
      id: "teachers",
      title: "Manage Teachers",
      description: "View, add, edit teacher accounts. Reset passwords and assign class codes.",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-600",
      stats: stats.totalTeachers,
      features: ["Add/Edit/Delete Teachers", "Password Reset", "Class Code Assignment", "Account Activation", "Bulk Operations"]
    },
    {
      id: "students", 
      title: "Manage Students",
      description: "Complete student management with bulk upload, password reset, and class assignment.",
      icon: Users,
      color: "from-green-500 to-green-600",
      stats: stats.totalStudents,
      features: ["Bulk CSV Upload", "Password Reset", "Manual Class Assignment", "Account Suspension", "Activity Monitoring"]
    },
    {
      id: "classes",
      title: "Class Management", 
      description: "Create, edit classes, assign teachers, set subjects, and control visibility.",
      icon: School,
      color: "from-purple-500 to-purple-600",
      stats: stats.activeClasses,
      features: ["Create/Edit Classes", "Teacher Assignment", "Subject Configuration", "Public/Private Control", "Code Lock System"]
    },
    {
      id: "assignments",
      title: "Assignment Control",
      description: "Monitor all assignments, delete inappropriate content, and manage templates.",
      icon: FileText,
      color: "from-orange-500 to-orange-600", 
      stats: stats.totalAssignments,
      features: ["View All Assignments", "Content Moderation", "Template Management", "Cross-Class Cloning", "Bulk Operations"]
    },
    {
      id: "moderation",
      title: "Content Moderation",
      description: "AI-powered content filtering, chat monitoring, and report management.",
      icon: Shield,
      color: "from-red-500 to-red-600",
      stats: stats.pendingReports,
      features: ["Chat Monitoring", "AI Word Filtering", "Report Management", "Content Blocking", "User Sanctions"]
    },
    {
      id: "nft-tracker",
      title: "NFT & Code Tracker",
      description: "Track NFT minting, class code usage, expiry control, and wallet mapping.",
      icon: Coins,
      color: "from-yellow-500 to-yellow-600",
      stats: stats.nftUsageCount,
      features: ["Minting Tracker", "Code Usage Analytics", "Expiry Management", "Wallet Mapping", "Blockchain Integration"]
    },
    {
      id: "upload-center",
      title: "Upload Center",
      description: "Upload school-wide materials and auto-publish to all class dashboards.",
      icon: Upload,
      color: "from-indigo-500 to-indigo-600",
      stats: "Active",
      features: ["Video Upload", "PDF Management", "Presentation Sharing", "Auto-Publishing", "Resource Library"]
    },
    {
      id: "notifications",
      title: "Notification System",
      description: "Send announcements to all users, specific classes, or individuals.",
      icon: Bell,
      color: "from-pink-500 to-pink-600",
      stats: "Live",
      features: ["Broadcast Messages", "Class Targeting", "Individual Alerts", "Push Notifications", "Email Integration"]
    },
    {
      id: "backup-export",
      title: "Backup & Export",
      description: "Download database backups, export reports, and manage system data.",
      icon: Download,
      color: "from-cyan-500 to-cyan-600",
      stats: "Ready",
      features: ["User Data Export", "Assignment Backup", "NFT Records", "Activity Reports", "CSV Generation"]
    },
    {
      id: "access-logs",
      title: "Security & Access Logs",
      description: "Monitor login history, failed attempts, and route access tracking.",
      icon: Lock,
      color: "from-gray-500 to-gray-600",
      stats: "Monitoring",
      features: ["Login History", "Failed Attempts", "IP Tracking", "Route Monitoring", "Security Analytics"]
    },
    {
      id: "site-settings",
      title: "Site Settings",
      description: "Customize school branding, themes, maintenance mode, and registration control.",
      icon: Palette,
      color: "from-violet-500 to-violet-600",
      stats: "Config",
      features: ["Logo/Theme Customization", "Color Schemes", "Maintenance Mode", "Registration Control", "Domain Management"]
    },
    {
      id: "system-monitoring",
      title: "System Monitoring",
      description: "Real-time system performance, database health, and resource monitoring.",
      icon: BarChart3,
      color: "from-teal-500 to-teal-600",
      stats: "Live",
      features: ["Performance Metrics", "Database Health", "Resource Usage", "Error Tracking", "Uptime Monitoring"]
    }
  ];

  if (loading || !authChecked) {
    console.log('AdminDashboard: Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your comprehensive admin environment...</p>
        </div>
      </div>
    );
  }

  console.log('AdminDashboard: Rendering comprehensive admin dashboard');

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
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-800/80 p-2 border border-slate-700/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80">
              Overview
            </TabsTrigger>
            <TabsTrigger value="teachers" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80">
              Teachers
            </TabsTrigger>
            <TabsTrigger value="students" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80">
              Students
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80">
              Classes
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80">
              Moderation
            </TabsTrigger>
            <TabsTrigger value="system" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80">
              System
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

          <TabsContent value="teachers" className="space-y-6">
            <TeacherManagement />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassManagement />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <AssignmentControl />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="nft-tracker" className="space-y-6">
            <NFTTracker />
          </TabsContent>

          <TabsContent value="upload-center" className="space-y-6">
            <UploadCenter />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSystem />
          </TabsContent>

          <TabsContent value="backup-export" className="space-y-6">
            <BackupExport />
          </TabsContent>

          <TabsContent value="access-logs" className="space-y-6">
            <AccessLogs />
          </TabsContent>

          <TabsContent value="site-settings" className="space-y-6">
            <SiteSettings />
          </TabsContent>

          <TabsContent value="system-monitoring" className="space-y-6">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AdminStatsCard
                  title="System Monitoring"
                  description="Real-time system performance and health monitoring"
                  icon={BarChart3}
                  stats="Live"
                  color="from-green-500 to-green-600"
                  features={["Performance Metrics", "Database Health", "Error Tracking"]}
                  onClick={() => setActiveTab("system-monitoring")}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <AdminStatsCard
                  title="Security Controls"
                  description="Advanced security settings and access management"
                  icon={Shield}
                  stats="Protected"
                  color="from-red-500 to-red-600"
                  features={["Access Control", "Security Logs", "Threat Detection"]}
                  onClick={() => setActiveTab("security-controls")}
                />
              </motion.div>
            </div>
            
            <SecurityControls />
          </TabsContent>
        </Tabs>

        <AdminSystemStatus />
      </div>
    </div>
  );
};

export default AdminDashboard;
