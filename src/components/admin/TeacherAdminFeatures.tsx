
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
      color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
      available: true
    },
    {
      title: "Class Management",
      description: "Create and manage your classes",
      icon: BookOpen,
      route: "/classes",
      color: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
      available: true
    },
    {
      title: "Assignments",
      description: "Create and manage assignments",
      icon: FileText,
      route: "/assignments",
      color: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20",
      available: true
    },
    {
      title: "Attendance Tracking",
      description: "Monitor and manage student attendance",
      icon: UserCheck,
      route: "/attendance",
      color: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20",
      available: true
    },
    {
      title: "Behavior Management",
      description: "Track student behavior and discipline",
      icon: Shield,
      route: "/behavior",
      color: "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20",
      available: true
    },
    {
      title: "Analytics Dashboard",
      description: "View detailed performance analytics",
      icon: BarChart,
      route: "/dashboard",
      color: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
      available: true
    },
    {
      title: "Announcements",
      description: "Send announcements to your classes",
      icon: Megaphone,
      route: "/notifications",
      color: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
      available: true
    },
    {
      title: "Notifications",
      description: "Manage system notifications",
      icon: Bell,
      route: "/notifications",
      color: "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20",
      available: true
    },
    {
      title: "NFT Rewards",
      description: "Create and manage NFT rewards",
      icon: Trophy,
      route: "/wallet",
      color: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
      available: true
    },
    {
      title: "Class Schedule",
      description: "Manage class schedules and timetables",
      icon: Calendar,
      route: "/classes",
      color: "bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/20",
      available: true
    },
    {
      title: "Communication",
      description: "Message students and parents",
      icon: MessageSquare,
      route: "/notifications",
      color: "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20",
      available: true
    },
    {
      title: "Teacher Settings",
      description: "Configure your teaching preferences",
      icon: Settings,
      route: "/settings",
      color: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20",
      available: true
    }
  ];

  const handleNavigation = async (route: string, title: string, available: boolean) => {
    console.log(`🔥 Button clicked for ${title}`);
    console.log(`📍 Route: ${route}, Available: ${available}`);
    
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
      
      // Small delay to show loading state
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
      // Reset loading state after navigation
      setTimeout(() => setLoadingFeature(null), 500);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Teacher Admin Features</h1>
        <p className="text-gray-400">Manage your classroom and students with these comprehensive admin tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;
          const isLoading = loadingFeature === feature.title;
          
          return (
            <Card 
              key={feature.title} 
              className={`p-6 ${feature.color} transition-all duration-200 hover:scale-105 border cursor-pointer ${!feature.available ? 'opacity-75' : ''} ${isLoading ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-black/20">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                    {!feature.available && <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span>}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                </div>
                <Button 
                  onClick={() => handleNavigation(feature.route, feature.title, feature.available)}
                  className={`w-full transition-all duration-200 ${
                    feature.available 
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                      : 'bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 border border-gray-500/20'
                  }`}
                  disabled={isLoading || !feature.available}
                >
                  {isLoading ? 'Loading...' : (feature.available ? `Access ${feature.title}` : 'Coming Soon')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
