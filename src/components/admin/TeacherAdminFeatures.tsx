
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  BarChart, 
  Settings, 
  FileText, 
  Megaphone, 
  Shield,
  Calendar,
  Trophy,
  MessageSquare,
  UserCheck,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";

export const TeacherAdminFeatures = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingFeature, setLoadingFeature] = useState<string | null>(null);

  const adminFeatures = [
    {
      title: "Manage Students",
      description: "Add, remove, and manage student accounts",
      icon: Users,
      route: "/students",
      color: "from-blue-600/20 to-cyan-600/20",
      hoverColor: "hover:from-blue-600/30 hover:to-cyan-600/30",
      iconColor: "text-blue-400",
      available: true
    },
    {
      title: "Class Management",
      description: "Create and manage your classes",
      icon: BookOpen,
      route: "/classes",
      color: "from-green-600/20 to-emerald-600/20",
      hoverColor: "hover:from-green-600/30 hover:to-emerald-600/30",
      iconColor: "text-green-400",
      available: true
    },
    {
      title: "Assignments",
      description: "Create and manage assignments",
      icon: FileText,
      route: "/assignments",
      color: "from-orange-600/20 to-amber-600/20",
      hoverColor: "hover:from-orange-600/30 hover:to-amber-600/30",
      iconColor: "text-orange-400",
      available: true
    },
    {
      title: "Attendance Tracking",
      description: "Monitor and manage student attendance",
      icon: UserCheck,
      route: "/attendance",
      color: "from-cyan-600/20 to-teal-600/20",
      hoverColor: "hover:from-cyan-600/30 hover:to-teal-600/30",
      iconColor: "text-cyan-400",
      available: true
    },
    {
      title: "Behavior Management",
      description: "Track student behavior and discipline",
      icon: Shield,
      route: "/behavior",
      color: "from-indigo-600/20 to-purple-600/20",
      hoverColor: "hover:from-indigo-600/30 hover:to-purple-600/30",
      iconColor: "text-indigo-400",
      available: true
    },
    {
      title: "Analytics Dashboard",
      description: "View detailed performance analytics",
      icon: BarChart,
      route: "/dashboard",
      color: "from-purple-600/20 to-pink-600/20",
      hoverColor: "hover:from-purple-600/30 hover:to-pink-600/30",
      iconColor: "text-purple-400",
      available: true
    },
    {
      title: "Announcements",
      description: "Send announcements to your classes",
      icon: Megaphone,
      route: "/notifications",
      color: "from-red-600/20 to-rose-600/20",
      hoverColor: "hover:from-red-600/30 hover:to-rose-600/30",
      iconColor: "text-red-400",
      available: true
    },
    {
      title: "Notifications",
      description: "Manage system notifications",
      icon: Bell,
      route: "/notifications",
      color: "from-yellow-600/20 to-orange-600/20",
      hoverColor: "hover:from-yellow-600/30 hover:to-orange-600/30",
      iconColor: "text-yellow-400",
      available: true
    },
    {
      title: "NFT Rewards",
      description: "Create and manage NFT rewards",
      icon: Trophy,
      route: "/wallet",
      color: "from-amber-600/20 to-yellow-600/20",
      hoverColor: "hover:from-amber-600/30 hover:to-yellow-600/30",
      iconColor: "text-amber-400",
      available: true
    },
    {
      title: "Class Schedule",
      description: "Manage class schedules and timetables",
      icon: Calendar,
      route: "/classes",
      color: "from-teal-600/20 to-green-600/20",
      hoverColor: "hover:from-teal-600/30 hover:to-green-600/30",
      iconColor: "text-teal-400",
      available: true
    },
    {
      title: "Communication",
      description: "Message students and parents",
      icon: MessageSquare,
      route: "/notifications",
      color: "from-pink-600/20 to-purple-600/20",
      hoverColor: "hover:from-pink-600/30 hover:to-purple-600/30",
      iconColor: "text-pink-400",
      available: true
    },
    {
      title: "Teacher Settings",
      description: "Configure your teaching preferences",
      icon: Settings,
      route: "/settings",
      color: "from-gray-600/20 to-slate-600/20",
      hoverColor: "hover:from-gray-600/30 hover:to-slate-600/30",
      iconColor: "text-gray-400",
      available: true
    }
  ];

  const handleNavigation = async (route: string, title: string, available: boolean) => {
    console.log(`🔥 Teacher admin button clicked: ${title} -> ${route}`);
    
    if (loadingFeature) {
      console.log('Another feature is loading, ignoring click');
      return;
    }

    if (!available) {
      console.log(`⚠️ Feature ${title} is not available`);
      toast({
        variant: "destructive",
        title: "Feature Coming Soon",
        description: `${title} is currently being developed and will be available soon.`,
      });
      return;
    }

    try {
      setLoadingFeature(title);
      console.log(`✅ Navigating to ${route} for ${title}`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      navigate(route);
      
      toast({
        title: "Navigation Successful",
        description: `Opening ${title}...`,
      });
      
    } catch (error) {
      console.error("❌ Navigation failed:", error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: `Failed to navigate to ${title}. Please try again.`,
      });
    } finally {
      setTimeout(() => setLoadingFeature(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Teacher Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive tools to manage your classroom, track student progress, and enhance your teaching experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isLoading = loadingFeature === feature.title;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ 
                  scale: 1.03,
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <Card 
                  className={`relative overflow-hidden bg-gradient-to-br ${feature.color} ${feature.hoverColor} 
                    border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 
                    backdrop-blur-sm cursor-pointer h-full shadow-lg hover:shadow-2xl
                    ${!feature.available ? 'opacity-75' : ''} 
                    ${isLoading ? 'opacity-50' : ''}`}
                  onClick={() => handleNavigation(feature.route, feature.title, feature.available)}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                  
                  <div className="relative z-10 p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        className="p-3 rounded-xl bg-black/20 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className={`h-7 w-7 ${feature.iconColor} drop-shadow-sm`} />
                      </motion.div>
                      
                      {!feature.available && (
                        <span className="text-xs px-2 py-1 bg-gray-600/50 text-gray-300 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 flex-1">
                        {feature.description}
                      </p>
                      
                      <Button 
                        className={`w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 
                          text-purple-200 border border-purple-500/30 hover:border-purple-400/50 
                          transition-all duration-300 group-hover:shadow-lg font-medium h-11
                          ${!feature.available ? 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border-gray-500/20' : ''}
                        `}
                        disabled={isLoading || !feature.available}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation(feature.route, feature.title, feature.available);
                        }}
                      >
                        <motion.div
                          className="flex items-center gap-2"
                          whileHover={{ x: 2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            feature.available ? `Access ${feature.title}` : 'Coming Soon'
                          )}
                        </motion.div>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
