
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Settings, 
  BarChart3, 
  Shield, 
  Coins, 
  Activity,
  FileText,
  Palette,
  Bell,
  Lock,
  TrendingUp,
  UserCog,
  Database
} from "lucide-react";

interface SuperAdminStats {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalNFTs: number;
  activeClasses: number;
  monthlyMints: number;
}

export const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalNFTs: 0,
    activeClasses: 0,
    monthlyMints: 0
  });

  const adminSections = [
    {
      id: "schools",
      title: "School Management",
      icon: Building2,
      color: "bg-blue-500",
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
      icon: GraduationCap,
      color: "bg-green-500",
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
      icon: Users,
      color: "bg-purple-500", 
      features: [
        "View All Students (cross-class)",
        "Filter by Class, Achievement Type, XP",
        "Bulk Wallet Setup (for minors)",
        "Reset Student Passwords or Logins"
      ]
    },
    {
      id: "blockchain",
      title: "NFT Contract & Blockchain",
      icon: Coins,
      color: "bg-orange-500",
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
      title: "Rules & Categories",
      icon: Settings,
      color: "bg-indigo-500",
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
      icon: BarChart3,
      color: "bg-cyan-500",
      features: [
        "Class-wise & School-wide XP Summary",
        "NFT Minting Trends (per week/month)",
        "Most Active Teachers / Students", 
        "Export Reports (PDF, Excel, JSON)"
      ]
    },
    {
      id: "system",
      title: "System Settings",
      icon: UserCog,
      color: "bg-pink-500",
      features: [
        "Language & Regional Options",
        "School Branding (logos, UI themes)",
        "Notification Settings",
        "Connected Integrations (Google, MS Teams)"
      ]
    },
    {
      id: "security",
      title: "Audit & Security",
      icon: Shield,
      color: "bg-red-500",
      features: [
        "Admin Access Logs",
        "NFT Mint/Burn Logs",
        "Data Protection (GDPR toggle)",
        "Set Two-Factor Authentication (2FA)"
      ]
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
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Super Admin Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Comprehensive system administration and oversight
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Schools</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSchools}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Teachers</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTeachers}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Students</p>
                  <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">NFTs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalNFTs}</p>
                </div>
                <Coins className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Classes</p>
                  <p className="text-2xl font-bold text-white">{stats.activeClasses}</p>
                </div>
                <Activity className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Monthly Mints</p>
                  <p className="text-2xl font-bold text-white">{stats.monthlyMints}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${section.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {section.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {section.features.length} features
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.features.map((feature, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={() => console.log(`Navigate to ${section.id}`)}
                    >
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Future Features Teaser */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-6 w-6" />
              Future Admin Features
            </CardTitle>
            <CardDescription className="text-gray-300">
              Advanced capabilities coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "AI Auto-Flagging for Unusual Behaviour",
                "Attendance Sync with SIS Systems", 
                "District-wide Leaderboards",
                "Multi-Admin Collaboration with Roles"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300">
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    Coming Soon
                  </Badge>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
