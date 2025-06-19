
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  BarChart, 
  Settings, 
  FileText, 
  Megaphone, 
  Palette,
  Shield,
  Calendar,
  Trophy,
  MessageSquare,
  Database,
  UserCheck,
  Bell
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const TeacherAdminFeatures = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const adminFeatures = [
    {
      title: "Manage Students",
      description: "Add, remove, and manage student accounts",
      icon: Users,
      route: "/students",
      color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
    },
    {
      title: "Class Management",
      description: "Create and manage your classes",
      icon: BookOpen,
      route: "/classes",
      color: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
    },
    {
      title: "Assignments",
      description: "Create and manage assignments",
      icon: FileText,
      route: "/assignments",
      color: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
    },
    {
      title: "Attendance Tracking",
      description: "Monitor and manage student attendance",
      icon: UserCheck,
      route: "/attendance",
      color: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20"
    },
    {
      title: "Behavior Management",
      description: "Track student behavior and discipline",
      icon: Shield,
      route: "/behavior",
      color: "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
    },
    {
      title: "Analytics Dashboard",
      description: "View detailed performance analytics",
      icon: BarChart,
      route: "/dashboard",
      color: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
    },
    {
      title: "Announcements",
      description: "Send announcements to your classes",
      icon: Megaphone,
      route: "/dashboard",
      color: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
    },
    {
      title: "Notifications",
      description: "Manage system notifications",
      icon: Bell,
      route: "/notifications",
      color: "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"
    },
    {
      title: "NFT Rewards",
      description: "Create and manage NFT rewards",
      icon: Trophy,
      route: "/wallet",
      color: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
    },
    {
      title: "Class Schedule",
      description: "Manage class schedules and timetables",
      icon: Calendar,
      route: "/classes",
      color: "bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20"
    },
    {
      title: "Communication",
      description: "Message students and parents",
      icon: MessageSquare,
      route: "/notifications",
      color: "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20"
    },
    {
      title: "Teacher Settings",
      description: "Configure your teaching preferences",
      icon: Settings,
      route: "/settings",
      color: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20"
    }
  ];

  const handleAccessClick = (route: string, title: string) => {
    console.log(`=== BUTTON CLICK DEBUG ===`);
    console.log(`Current location: ${location.pathname}`);
    console.log(`Button clicked: ${title}`);
    console.log(`Target route: ${route}`);
    console.log(`Current timestamp: ${new Date().toISOString()}`);
    
    try {
      console.log(`Attempting navigation from ${location.pathname} to ${route}`);
      
      // Force navigation
      navigate(route);
      
      // Show success toast
      toast({
        title: "Navigating...",
        description: `Going to ${title}`,
      });
      
      console.log(`✅ Navigation command sent to ${route}`);
      
    } catch (error) {
      console.error("Navigation failed with error:", error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: `Failed to navigate to ${route}: ${error}`,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Teacher Admin Features</h1>
        <p className="text-gray-400">Manage your classroom and students with these comprehensive admin tools</p>
        <p className="text-gray-500 text-sm mt-2">Current page: {location.pathname}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.title} 
              className={`p-6 ${feature.color} transition-all duration-200 hover:scale-105 border`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-black/20">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                </div>
                <Button 
                  onClick={(e) => {
                    console.log(`🔥 BUTTON PHYSICALLY CLICKED: ${feature.title}`);
                    e.preventDefault();
                    e.stopPropagation();
                    handleAccessClick(feature.route, feature.title);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200"
                >
                  Access {feature.title}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
