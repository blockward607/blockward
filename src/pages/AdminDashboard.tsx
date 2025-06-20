
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  School, 
  Users, 
  GraduationCap, 
  Coins, 
  Trophy, 
  BarChart3, 
  Settings, 
  Shield, 
  FileText,
  Bell,
  Palette,
  Lock,
  UserPlus,
  BookOpen,
  Wallet,
  ChartBar,
  Eye,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("overview");

  const adminSections: AdminSection[] = [
    {
      id: "schools",
      title: "School / Institution Management",
      description: "Manage schools, assign admins, and oversee institutional operations",
      icon: School,
      color: "from-blue-600 to-cyan-600",
      features: [
        "Create / Manage Schools",
        "Assign School Admins", 
        "View All Classes by School",
        "School-level NFT Analytics"
      ]
    },
    {
      id: "teachers",
      title: "Teacher Management",
      description: "Add, manage, and monitor teacher accounts and permissions",
      icon: UserPlus,
      color: "from-green-600 to-emerald-600",
      features: [
        "Add / Remove Teachers",
        "Assign Teachers to Classes",
        "Set Permissions (NFT mint access)",
        "Monitor Teacher Activity Logs",
        "Suspend / Archive Teacher Accounts"
      ]
    },
    {
      id: "students",
      title: "Student Oversight",
      description: "Comprehensive student management across all classes",
      icon: GraduationCap,
      color: "from-purple-600 to-pink-600",
      features: [
        "View All Students (cross-class)",
        "Filter by Class, Achievement Type, XP",
        "Bulk Wallet Setup (for minors)",
        "Reset Student Passwords or Logins"
      ]
    },
    {
      id: "blockchain",
      title: "NFT Contract & Blockchain Settings",
      description: "Manage smart contracts and blockchain configurations",
      icon: Coins,
      color: "from-orange-600 to-red-600",
      features: [
        "View Smart Contract Details",
        "Manage Contract Metadata Settings",
        "Toggle Soulbound vs Transferable NFTs",
        "Enable/Disable Wallet Requirements",
        "Customize NFT Templates"
      ]
    },
    {
      id: "rules",
      title: "Rules & Categories Configuration",
      description: "Define achievement systems and gamification rules",
      icon: Trophy,
      color: "from-yellow-600 to-orange-600",
      features: [
        "Define Achievement Categories",
        "Set XP Values per Category",
        "Create Custom Badges / Auto-Unlock Criteria",
        "Define Leaderboard Rules"
      ]
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      description: "Comprehensive insights and data export capabilities",
      icon: BarChart3,
      color: "from-indigo-600 to-purple-600",
      features: [
        "Class-wise & School-wide XP Summary",
        "NFT Minting Trends",
        "Most Active Teachers / Students",
        "Export Reports (PDF, Excel, JSON)"
      ]
    },
    {
      id: "system",
      title: "System Settings",
      description: "Platform configuration and customization options",
      icon: Settings,
      color: "from-teal-600 to-blue-600",
      features: [
        "Language & Regional Options",
        "School Branding (logos, UI themes)",
        "Notification Settings",
        "Connected Integrations"
      ]
    },
    {
      id: "security",
      title: "Audit & Security",
      description: "Security monitoring and compliance management",
      icon: Shield,
      color: "from-red-600 to-pink-600",
      features: [
        "Admin Access Logs",
        "NFT Mint/Burn Logs",
        "Data Protection (GDPR toggle)",
        "Set Two-Factor Authentication (2FA)"
      ]
    }
  ];

  useEffect(() => {
    // Check admin authentication
    if (!user) {
      navigate('/admin-login');
    }
  }, [user, navigate]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    toast({
      title: "Section Selected",
      description: `Opening ${adminSections.find(s => s.id === sectionId)?.title}...`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                BlockWard Admin Panel
              </h1>
              <p className="text-gray-300 mt-2">Comprehensive school management and blockchain administration</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-gray-800/50 p-2">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            {adminSections.map(section => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="text-xs"
              >
                {section.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {adminSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <Card className={`h-full bg-gradient-to-br ${section.color}/10 border-gray-700/50 hover:border-purple-500/40 transition-all duration-300`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color}/20`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <CardTitle className="text-lg text-white group-hover:text-purple-200 transition-colors">
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors">
                          {section.description}
                        </p>
                        <div className="space-y-1">
                          {section.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-1 h-1 bg-purple-400 rounded-full" />
                              {feature}
                            </div>
                          ))}
                          {section.features.length > 3 && (
                            <div className="text-xs text-purple-400">
                              +{section.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Individual Section Tabs */}
          {adminSections.map(section => (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color}/20`}>
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">{section.title}</CardTitle>
                        <p className="text-gray-400">{section.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.features.map((feature, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="justify-start h-auto p-4 border-gray-600 hover:border-purple-500/50 hover:bg-purple-500/10"
                          onClick={() => toast({
                            title: "Feature Coming Soon",
                            description: `${feature} will be available in the next update.`
                          })}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span className="text-left">{feature}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Future Features Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Future Admin Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "AI Auto-Flagging for Unusual Behaviour", icon: Eye },
                  { name: "Attendance Sync with SIS", icon: BookOpen },
                  { name: "District-wide Leaderboards", icon: Trophy },
                  { name: "Multi-Admin Collaboration", icon: Users }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                    <feature.icon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">{feature.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
