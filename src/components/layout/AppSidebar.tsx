import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  Users, 
  BookOpen, 
  Settings, 
  Award, 
  UserCheck,
  BarChart3,
  FileText,
  Wallet,
  Bell,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Shield
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminAccessButton } from "@/components/admin/AdminAccessButton";

interface SidebarItem {
  title: string;
  icon: any;
  href: string;
  badge?: number;
  children?: SidebarItem[];
}

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(roleData?.role as 'teacher' | 'student');
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
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

  const teacherItems: SidebarItem[] = [
    { title: "Dashboard", icon: Home, href: "/dashboard" },
    { title: "Classes", icon: BookOpen, href: "/classes" },
    { title: "Students", icon: Users, href: "/students" },
    { title: "Attendance", icon: UserCheck, href: "/attendance" },
    { title: "Behavior", icon: BarChart3, href: "/behavior" },
    { title: "Assignments", icon: FileText, href: "/assignments" },
    { title: "Grades", icon: BarChart3, href: "/grades" },
    { title: "Resources", icon: BookOpen, href: "/resources" },
    { title: "BlockWards & NFTs", icon: Award, href: "/wallet" },
    { title: "Notifications", icon: Bell, href: "/notifications" },
    { title: "Settings", icon: Settings, href: "/settings" }
  ];

  const studentItems: SidebarItem[] = [
    { title: "Dashboard", icon: Home, href: "/student-dashboard" },
    { title: "Classes", icon: BookOpen, href: "/classes" },
    { title: "Assignments", icon: FileText, href: "/assignments" },
    { title: "Grades", icon: BarChart3, href: "/grades" },
    { title: "Progress", icon: TrendingUp, href: "/progress" },
    { title: "My BlockWards", icon: Award, href: "/wallet" },
    { title: "Notifications", icon: Bell, href: "/notifications" },
    { title: "Settings", icon: Settings, href: "/settings" }
  ];

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between h-10 px-4 text-gray-300 hover:text-white hover:bg-gray-800/50",
                isActive && "bg-purple-600/20 text-purple-300"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => renderSidebarItem(child))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        onClick={() => navigate(item.href)}
        className={cn(
          "w-full justify-start h-10 px-4 text-gray-300 hover:text-white hover:bg-gray-800/50",
          isActive && "bg-purple-600/20 text-purple-300"
        )}
      >
        <item.icon className="h-4 w-4 mr-3" />
        <span className="text-sm font-medium">{item.title}</span>
        {item.badge && (
          <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
            {item.badge}
          </span>
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = userRole === 'student' ? studentItems : teacherItems;

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full"
    >
      <div className="p-4 flex-1">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            {userRole === 'student' ? 'Student Portal' : 'Teacher Portal'}
          </h2>
          <div className="text-sm text-gray-400 capitalize">
            {userRole} Dashboard
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map(renderSidebarItem)}
        </nav>

        <Separator className="my-6 bg-gray-700" />

        <div className="space-y-2">
          <AdminAccessButton />
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </div>
    </motion.div>
  );
};
