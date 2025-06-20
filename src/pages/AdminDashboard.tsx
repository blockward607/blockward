
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
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminQuickStats } from "@/components/admin/AdminQuickStats";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";

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
      id: "teachers",
      title: "Manage Teachers",
      description: "View, add, edit teacher accounts and permissions",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      stats: stats.totalTeachers,
      features: ["Add/Edit/Delete", "Reset Passwords", "Assign Classes", "Account Status"]
    },
    {
      id: "students", 
      title: "Manage Students",
      description: "Student registration, bulk upload, and account management",
      icon: GraduationCap,
      color: "from-green-500 to-green-600",
      stats: stats.totalStudents,
      features: ["Bulk CSV Upload", "Password Reset", "Class Assignment", "Suspend/Ban"]
    },
    {
      id: "classes",
      title: "Class Management",
      description: "Create, edit classes and manage visibility settings",
      icon: School,
      color: "from-purple-500 to-purple-600",
      stats: stats.activeClasses,
      features: ["Create/Edit Classes", "Assign Teachers", "Set Subjects", "Control Visibility"]
    },
    {
      id: "assignments",
      title: "Assignment Control",
      description: "Monitor and manage all assignments across classes",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      stats: stats.totalAssignments,
      features: ["View All Tasks", "Delete Content", "Clone Assignments", "Add Templates"]
    },
    {
      id: "moderation",
      title: "Content Moderation",
      description: "Monitor chats, messages and filter inappropriate content",
      icon: MessageSquare,
      color: "from-red-500 to-red-600",
      stats: "24/7",
      features: ["Monitor Chats", "AI Filtering", "Report Management", "Block Content"]
    },
    {
      id: "nft-tracker",
      title: "NFT & Code Tracker",
      description: "Track NFT minting, class codes and blockchain activity",
      icon: Coins,
      color: "from-yellow-500 to-yellow-600",
      stats: stats.nftsMinted,
      features: ["Code Usage", "NFT Tracking", "Expiry Control", "Wallet Mapping"]
    },
    {
      id: "uploads",
      title: "Upload Center",
      description: "Upload school-wide materials and resources",
      icon: Upload,
      color: "from-indigo-500 to-indigo-600",
      stats: "∞",
      features: ["Upload Materials", "Auto-Publish", "Video/PDF Support", "Bulk Upload"]
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Send announcements and alerts to users",
      icon: Bell,
      color: "from-pink-500 to-pink-600",
      stats: "Active",
      features: ["Broadcast Messages", "Targeted Alerts", "Push Notifications", "Email Alerts"]
    },
    {
      id: "backup",
      title: "Backup & Export",
      description: "Download database backups and export reports",
      icon: Download,
      color: "from-teal-500 to-teal-600",
      stats: "Ready",
      features: ["User Data Export", "Assignment Backup", "NFT Records", "CSV Reports"]
    },
    {
      id: "security",
      title: "Security & Logs",
      description: "Monitor login history and access patterns",
      icon: Shield,
      color: "from-gray-500 to-gray-600",
      stats: stats.recentActivity,
      features: ["Login History", "Failed Attempts", "Access Logs", "IP Tracking"]
    },
    {
      id: "settings",
      title: "Site Settings",
      description: "Configure school branding, themes and access control",
      icon: Settings,
      color: "from-slate-500 to-slate-600",
      stats: "Config",
      features: ["School Branding", "Color Themes", "Maintenance Mode", "Registration Control"]
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
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-2 bg-slate-800/80 p-2 border border-slate-700/50 backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="teachers" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors text-xs"
            >
              Teachers
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors text-xs"
            >
              Students
            </TabsTrigger>
            <TabsTrigger 
              value="classes" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors text-xs"
            >
              Classes
            </TabsTrigger>
            <TabsTrigger 
              value="nfts" 
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-purple-600/80 hover:text-white transition-colors text-xs"
            >
              NFTs
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

          {/* Individual feature tabs would go here */}
        </Tabs>

        <AdminSystemStatus />
      </div>
    </div>
  );
};

export default AdminDashboard;
