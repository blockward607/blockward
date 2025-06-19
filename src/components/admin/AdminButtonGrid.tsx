
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AdminButton, AdminStats } from "./types";
import { iconMap } from "./iconMap";

interface AdminButtonGridProps {
  adminButtons: AdminButton[];
  stats: AdminStats;
}

export const AdminButtonGrid = ({ adminButtons, stats }: AdminButtonGridProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleActionClick = async (button: AdminButton) => {
    console.log(`🔥 Admin button clicked: ${button.title} -> ${button.route}`);
    
    if (actionLoading) {
      console.log('⚠️ Action already in progress, ignoring click');
      return;
    }

    try {
      setActionLoading(button.title);
      
      let targetRoute = button.route;
      
      switch (button.route) {
        case "/admin/teachers":
          targetRoute = "/admin";
          toast({
            title: "Teacher Management",
            description: "Opening teacher management in admin dashboard."
          });
          break;
        case "/admin/analytics":
          targetRoute = "/dashboard";
          toast({
            title: "Coming Soon",
            description: "Analytics page is coming soon. Redirecting to dashboard."
          });
          break;
        case "/admin/requests":
          targetRoute = "/admin";
          toast({
            title: "Admin Requests",
            description: "Opening admin dashboard to manage requests."
          });
          break;
        default:
          break;
      }
      
      console.log(`✅ Navigating to: ${targetRoute}`);
      navigate(targetRoute);
      
      if (!["Teacher Management", "Coming Soon", "Admin Requests"].some(msg => 
        button.title.includes("Teacher") || button.title.includes("Analytics") || button.title.includes("Requests")
      )) {
        toast({
          title: "Navigation",
          description: `Opening ${button.title}...`
        });
      }
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: `Failed to open ${button.title}. Please try again.`
      });
    } finally {
      setTimeout(() => setActionLoading(null), 500);
    }
  };

  const getButtonCount = (buttonTitle: string) => {
    switch (buttonTitle) {
      case 'Manage Students':
        return { count: stats.totalStudents, isUrgent: false };
      case 'Manage Teachers':
        return { count: stats.totalTeachers, isUrgent: false };
      case 'Classroom Management':
        return { count: stats.totalClasses, isUrgent: false };
      case 'Admin Requests':
        return { count: stats.pendingRequests, isUrgent: stats.pendingRequests > 0 };
      default:
        return { count: undefined, isUrgent: false };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {adminButtons.map((button) => {
        const IconComponent = iconMap[button.icon];
        const isLoading = actionLoading === button.title;
        const { count, isUrgent } = getButtonCount(button.title);
        
        return (
          <Card 
            key={button.id}
            className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${button.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                {count !== undefined && (
                  <Badge 
                    variant={isUrgent ? "destructive" : "secondary"}
                    className={isUrgent ? "animate-pulse" : ""}
                  >
                    {count}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-white text-lg">
                {button.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">{button.description}</p>
              <Button 
                type="button"
                disabled={isLoading}
                className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 cursor-pointer"
                onClick={() => handleActionClick(button)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : `Access ${button.title}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
