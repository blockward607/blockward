import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  School, 
  Settings,
  Bell,
  FileText,
  BarChart3,
  Shield,
  Clock,
  Building,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Wifi,
  HardDrive
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarItem {
  title: string;
  icon: any;
  onClick: () => void;
  badge?: number;
  active?: boolean;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
}

export const AdminSidebar = ({ activeTab, onTabChange, pendingCount = 0 }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy'
  });
  const [onlineUsers, setOnlineUsers] = useState(0);

  // Monitor system health
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Check database connection
        const { error: dbError } = await supabase.from('user_roles').select('count', { count: 'exact', head: true });
        
        setSystemHealth(prev => ({
          ...prev,
          database: dbError ? 'error' : 'healthy',
          api: 'healthy',
          storage: 'healthy'
        }));
      } catch (error) {
        setSystemHealth(prev => ({
          ...prev,
          database: 'error',
          api: 'error'
        }));
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor online users (simplified)
  useEffect(() => {
    const updateOnlineUsers = () => {
      setOnlineUsers(Math.floor(Math.random() * 50) + 10); // Simulated for demo
    };
    
    updateOnlineUsers();
    const interval = setInterval(updateOnlineUsers, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "Successfully logged out from admin panel"
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  const adminMenuItems: AdminSidebarItem[] = [
    {
      title: "Overview",
      icon: BarChart3,
      onClick: () => onTabChange("overview"),
      active: activeTab === "overview",
      description: "Dashboard overview and analytics"
    },
    {
      title: "Pending Requests",
      icon: Clock,
      onClick: () => onTabChange("pending"),
      badge: pendingCount,
      active: activeTab === "pending",
      description: "Review new signup requests",
      priority: pendingCount > 0 ? 'high' : 'low'
    },
    {
      title: "Manage Teachers",
      icon: GraduationCap,
      onClick: () => onTabChange("teachers"),
      active: activeTab === "teachers",
      description: "Teacher accounts and permissions"
    },
    {
      title: "Manage Students", 
      icon: Users,
      onClick: () => onTabChange("students"),
      active: activeTab === "students",
      description: "Student profiles and enrollment"
    },
    {
      title: "Class Management",
      icon: School,
      onClick: () => onTabChange("classes"),
      active: activeTab === "classes",
      description: "Classrooms and course settings"
    },
    {
      title: "Institution Settings",
      icon: Building,
      onClick: () => onTabChange("institution"),
      active: activeTab === "institution",
      description: "School configuration and codes"
    },
    {
      title: "Announcements",
      icon: Bell,
      onClick: () => onTabChange("announcements"),
      active: activeTab === "announcements",
      description: "School-wide communications"
    },
    {
      title: "Reports & Analytics",
      icon: FileText,
      onClick: () => onTabChange("reports"),
      active: activeTab === "reports",
      description: "Performance insights and data"
    },
    {
      title: "Content Moderation",
      icon: Shield,
      onClick: () => onTabChange("moderation"),
      active: activeTab === "moderation",
      description: "Safety and content filtering"
    },
    {
      title: "System Settings",
      icon: Settings,
      onClick: () => onTabChange("system"),
      active: activeTab === "system",
      description: "Advanced system configuration"
    }
  ];

  const filteredMenuItems = adminMenuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'error': return <X className="w-3 h-3 text-red-400" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const quickActions = [
    {
      title: "Emergency Broadcast",
      icon: AlertTriangle,
      onClick: () => toast({ title: "Emergency mode activated" }),
      color: "text-red-400"
    },
    {
      title: "Quick Backup",
      icon: Database,
      onClick: () => toast({ title: "Backup initiated" }),
      color: "text-blue-400"
    }
  ];

  const renderSidebarItem = (item: AdminSidebarItem) => (
    <motion.div
      key={item.title}
      whileHover={{ x: collapsed ? 0 : 4 }}
      onHoverStart={() => setHoveredItem(item.title)}
      onHoverEnd={() => setHoveredItem(null)}
    >
      <Button
        variant="ghost"
        onClick={item.onClick}
        className={cn(
          "w-full group relative overflow-hidden transition-all duration-300 ease-out",
          "hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20",
          "border border-transparent hover:border-purple-500/30",
          collapsed ? "h-12 px-3 justify-center" : "h-14 px-4 justify-start",
          item.active && [
            "bg-gradient-to-r from-purple-600/30 to-blue-600/30",
            "border-purple-500/50 shadow-lg shadow-purple-500/25",
            "text-white font-medium"
          ],
          !item.active && "text-gray-300 hover:text-white"
        )}
      >
        {/* Priority indicator */}
        {item.priority === 'high' && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}

        {/* Background gradient on hover/active */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 transition-opacity duration-300",
          (item.active || hoveredItem === item.title) && "opacity-100"
        )} />
        
        {/* Icon container */}
        <div className={cn(
          "relative z-10 flex items-center justify-center",
          collapsed ? "w-6 h-6" : "w-6 h-6 mr-3 flex-shrink-0"
        )}>
          <item.icon 
            className={cn(
              "transition-all duration-300",
              item.active ? "text-purple-300" : "text-gray-400 group-hover:text-white",
              hoveredItem === item.title && "scale-110"
            )} 
            size={20} 
          />
        </div>

        {/* Text content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="relative z-10 flex-1 min-w-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">
                  {item.title}
                </span>
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 flex-shrink-0"
                  >
                    <Badge 
                      variant="destructive" 
                      className={cn(
                        "text-xs font-semibold shadow-lg",
                        item.priority === 'high' && "bg-red-600 animate-pulse"
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  </motion.div>
                )}

                {/* Arrow for active items */}
                {item.active && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 flex-shrink-0"
                  >
                    <ChevronRight size={16} className="text-purple-300" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active indicator */}
        {item.active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Button>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800",
        "border-r border-slate-700/50 backdrop-blur-sm",
        "flex flex-col h-full shadow-2xl relative overflow-hidden",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-80"
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-600/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-600/10 to-transparent" />
      </div>

      {/* Header */}
      <div className={cn(
        "relative z-10 p-4 border-b border-slate-700/50",
        "bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm"
      )}>
        <div className="flex items-center justify-between mb-4">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <Wifi className="w-3 h-3" />
                  {onlineUsers} users online
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors p-2"
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {collapsed ? <Menu size={18} /> : <X size={18} />}
            </motion.div>
          </Button>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search admin tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System Health Status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 p-4 border-b border-slate-700/50"
          >
            <div className="text-sm text-gray-400 mb-2">System Health</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1 text-xs">
                {getHealthIcon(systemHealth.database)}
                <span>DB</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {getHealthIcon(systemHealth.api)}
                <span>API</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {getHealthIcon(systemHealth.storage)}
                <span>Storage</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 p-4 border-b border-slate-700/50"
          >
            <div className="text-sm text-gray-400 mb-2">Quick Actions</div>
            <div className="flex gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className={cn("p-2", action.color)}
                  title={action.title}
                >
                  <action.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {filteredMenuItems.map(renderSidebarItem)}
        
        {searchQuery && filteredMenuItems.length === 0 && !collapsed && (
          <div className="text-center text-gray-400 text-sm py-4">
            No matching admin tools found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full group relative overflow-hidden transition-all duration-300",
            "hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20",
            "border border-transparent hover:border-red-500/30",
            "text-gray-300 hover:text-white",
            collapsed ? "h-12 px-3 justify-center" : "h-12 px-4 justify-start"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <LogOut 
            className={cn(
              "relative z-10 transition-all duration-300 text-gray-400 group-hover:text-red-400",
              collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
            )} 
          />
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="relative z-10 text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
};
