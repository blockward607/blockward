
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AdminButton, AdminStats } from "./types";
import { iconMap } from "./iconMap";
import { motion } from "framer-motion";

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
      {adminButtons.map((button, index) => {
        const IconComponent = iconMap[button.icon];
        const isLoading = actionLoading === button.title;
        const { count, isUrgent } = getButtonCount(button.title);
        
        return (
          <motion.div
            key={button.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            whileHover={{ 
              scale: 1.03,
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/80 border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm cursor-pointer h-full">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className={`p-3 rounded-xl ${button.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <IconComponent className="h-6 w-6 text-white drop-shadow-sm" />
                  </motion.div>
                  
                  {count !== undefined && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    >
                      <Badge 
                        variant={isUrgent ? "destructive" : "secondary"}
                        className={`font-semibold shadow-sm ${
                          isUrgent 
                            ? "animate-pulse bg-red-500/20 text-red-300 border-red-500/30" 
                            : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {count}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                
                <CardTitle className="text-white text-lg font-semibold group-hover:text-purple-200 transition-colors duration-300">
                  {button.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <p className="text-gray-400 text-sm mb-6 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {button.description}
                </p>
                
                <Button 
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-200 border border-purple-500/30 hover:border-purple-400/50 cursor-pointer transition-all duration-300 group-hover:shadow-lg font-medium h-11"
                  onClick={() => handleActionClick(button)}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      `Access ${button.title}`
                    )}
                  </motion.div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
