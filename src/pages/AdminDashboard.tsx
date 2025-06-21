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
  Palette,
  Clock,
  Building
} from "lucide-react";
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
import { PendingUsersManagement } from "@/components/admin/PendingUsersManagement";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { InstitutionCodeManager } from "@/components/admin/InstitutionCodeManager";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ClassManagement } from "@/components/admin/ClassManagement";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import { ContentModeration } from "@/components/admin/ContentModeration";

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
  pendingUsers: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [user, setUser] = useState<any>(null);
  const [adminSchoolId, setAdminSchoolId] = useState<string | null>(null);
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
    pendingReports: 0,
    pendingUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard: Starting initialization');
    
    const initializeDashboard = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('AdminDashboard: No session found, redirecting to admin login');
          navigate('/admin-login', { replace: true });
          return;
        }

        console.log('AdminDashboard: Session found for user:', session.user.id);
        setUser(session.user);

        // Check if user is admin and get their school_id
        const { data: adminProfile, error: adminError } = await supabase
          .from('admin_profiles')
          .select('school_id, full_name')
          .eq('user_id', session.user.id)
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error('AdminDashboard: Error checking admin profile:', adminError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to verify admin privileges"
          });
          navigate('/admin-login', { replace: true });
          return;
        }

        if (!adminProfile) {
          console.log('AdminDashboard: User is not admin');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Admin privileges required"
          });
          navigate('/admin-login', { replace: true });
          return;
        }

        console.log('AdminDashboard: Admin access confirmed for school:', adminProfile.school_id);
        setAdminSchoolId(adminProfile.school_id);
        await fetchAdminStats(adminProfile.school_id);
      } catch (error) {
        console.error('AdminDashboard: Initialization error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize admin dashboard"
        });
        navigate('/admin-login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate, toast]);

  const fetchAdminStats = async (schoolId: string) => {
    console.log('AdminDashboard: Fetching admin statistics for school:', schoolId);
    
    try {
      const results = await Promise.allSettled([
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', schoolId),
        supabase.from('teacher_profiles').select('id', { count: 'exact' }).eq('school_id', schoolId),
        supabase.from('classrooms').select('id', { count: 'exact' }).eq('school_id', schoolId),
        supabase.from('assignments').select('id', { count: 'exact' }),
        supabase.from('nfts').select('id', { count: 'exact' }),
        supabase.from('grades').select('id', { count: 'exact' }),
        supabase.from('classroom_codes').select('usage_count').eq('is_active', true),
        supabase.from('behavior_records').select('id', { count: 'exact' }).eq('resolved', false),
        supabase.from('pending_users').select('id', { count: 'exact' }).eq('status', 'pending').eq('school_id', schoolId)
      ]);

      const studentsCount = results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0;
      const teachersCount = results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0;
      const classesCount = results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0;
      const assignmentsCount = results[3].status === 'fulfilled' ? results[3].value.count || 0 : 0;
      const nftsCount = results[4].status === 'fulfilled' ? results[4].value.count || 0 : 0;
      const gradesCount = results[5].status === 'fulfilled' ? results[5].value.count || 0 : 0;
      const codeUsage = results[6].status === 'fulfilled' ? 
        (results[6].value.data || []).reduce((sum, code) => sum + (code.usage_count || 0), 0) : 0;
      const pendingReports = results[7].status === 'fulfilled' ? results[7].value.count || 0 : 0;
      const pendingUsers = results[8].status === 'fulfilled' ? results[8].value.count || 0 : 0;

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
        pendingReports: pendingReports,
        pendingUsers: pendingUsers
      });

      console.log('AdminDashboard: Stats updated successfully for school-specific data');
    } catch (error) {
      console.error('AdminDashboard: Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    console.log('AdminDashboard: Logging out');
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "Successfully logged out of admin panel"
    });
    navigate('/admin-login', { replace: true });
  };

  const quickStats = [
    { label: "Students", value: stats.totalStudents, icon: GraduationCap, color: "bg-gradient-to-r from-green-500 to-green-600" },
    { label: "Teachers", value: stats.totalTeachers, icon: Users, color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { label: "Classes", value: stats.activeClasses, icon: School, color: "bg-gradient-to-r from-purple-500 to-purple-600" },
    { label: "Pending Requests", value: stats.pendingUsers, icon: Clock, color: "bg-gradient-to-r from-orange-500 to-orange-600" },
    { label: "NFTs Minted", value: stats.nftsMinted, icon: Coins, color: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
    { label: "Completion Rate", value: stats.assignmentCompletionRate, icon: TrendingUp, color: "bg-gradient-to-r from-pink-500 to-pink-600" }
  ];

  const adminSections = [
    {
      id: "pending",
      title: "Pending Requests",
      description: "Review and approve new teacher and student signup requests.",
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      stats: stats.pendingUsers,
      features: ["Review Signups", "Approve/Reject Users", "Institution Code Management", "Bulk Operations", "Auto-notifications"]
    },
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
      id: "institution",
      title: "Institution Settings",
      description: "Manage institution codes, school settings, and access controls.",
      icon: Building,
      color: "from-indigo-500 to-indigo-600",
      stats: "Active",
      features: ["Institution Code Management", "School Settings", "Access Controls", "Branding", "Integration Settings"]
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
      id: "moderation",
      title: "Content Moderation",
      description: "AI-powered content filtering, chat monitoring, and report management.",
      icon: Shield,
      color: "from-red-500 to-red-600",
      stats: stats.pendingReports,
      features: ["Chat Monitoring", "AI Word Filtering", "Report Management", "Content Blocking", "User Sanctions"]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Admin Sidebar */}
      <div className="flex-shrink-0">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          pendingCount={stats.pendingUsers}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto p-6 max-w-7xl relative z-10 h-screen overflow-y-auto">
          <AdminHeader onLogout={handleLogout} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <AdminQuickStats stats={quickStats} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {activeTab === "overview" && (
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
                )}

                {activeTab === "pending" && <PendingUsersManagement schoolId={adminSchoolId} />}
                {activeTab === "teachers" && <TeacherManagement schoolId={adminSchoolId} />}
                {activeTab === "students" && <UserManagement schoolId={adminSchoolId} />}
                {activeTab === "institution" && <InstitutionCodeManager />}
                {activeTab === "classes" && <ClassManagement schoolId={adminSchoolId} />}
                {activeTab === "announcements" && <AnnouncementManagement />}
                {activeTab === "reports" && <ReportsAnalytics />}
                {activeTab === "moderation" && <ContentModeration />}

                {activeTab === "system" && (
                  <div className="space-y-6">
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
                          onClick={() => {}}
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
                          onClick={() => {}}
                        />
                      </motion.div>
                    </div>
                    
                    <SystemMonitoring />
                    <SecurityControls />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <AdminNotifications />
              <AdminSystemStatus />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
