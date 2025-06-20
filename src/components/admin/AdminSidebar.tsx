
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  School, 
  UserPlus,
  Settings,
  Bell,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Clock,
  Building,
  MessageSquare,
  Award,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarItem {
  title: string;
  icon: any;
  onClick: () => void;
  badge?: number;
  active?: boolean;
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "Successfully logged out from admin panel"
      });
      navigate('/admin-login');
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
      active: activeTab === "overview"
    },
    {
      title: "Pending Requests",
      icon: Clock,
      onClick: () => onTabChange("pending"),
      badge: pendingCount,
      active: activeTab === "pending"
    },
    {
      title: "Manage Teachers",
      icon: GraduationCap,
      onClick: () => onTabChange("teachers"),
      active: activeTab === "teachers"
    },
    {
      title: "Manage Students", 
      icon: Users,
      onClick: () => onTabChange("students"),
      active: activeTab === "students"
    },
    {
      title: "Class Management",
      icon: School,
      onClick: () => onTabChange("classes"),
      active: activeTab === "classes"
    },
    {
      title: "Institution Settings",
      icon: Building,
      onClick: () => onTabChange("institution"),
      active: activeTab === "institution"
    },
    {
      title: "Announcements",
      icon: Bell,
      onClick: () => onTabChange("announcements"),
      active: activeTab === "announcements"
    },
    {
      title: "Reports & Analytics",
      icon: FileText,
      onClick: () => onTabChange("reports"),
      active: activeTab === "reports"
    },
    {
      title: "Content Moderation",
      icon: Shield,
      onClick: () => onTabChange("moderation"),
      active: activeTab === "moderation"
    },
    {
      title: "System Settings",
      icon: Settings,
      onClick: () => onTabChange("system"),
      active: activeTab === "system"
    }
  ];

  const renderSidebarItem = (item: AdminSidebarItem) => (
    <Button
      key={item.title}
      variant="ghost"
      onClick={item.onClick}
      className={cn(
        "w-full justify-start h-12 px-4 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors",
        item.active && "bg-purple-600/20 text-purple-300 border-r-2 border-purple-500",
        collapsed && "px-3 justify-center"
      )}
    >
      <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
      {!collapsed && (
        <>
          <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
          {item.badge && item.badge > 0 && (
            <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Button>
  );

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={cn(
        "bg-gray-900 border-r border-gray-800 flex flex-col h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            <div className="text-sm text-gray-400">Management Dashboard</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {adminMenuItems.map(renderSidebarItem)}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50",
            collapsed && "justify-center px-3"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </Button>
      </div>
    </motion.div>
  );
};
