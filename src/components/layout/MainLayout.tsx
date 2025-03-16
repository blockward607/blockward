
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  BookOpen,
  Award,
  Settings,
  Menu,
  X,
  Bell,
  Calendar,
  ChartBar,
  Trophy,
  Wallet,
  FileText,
  BarChart,
  MessageSquare,
  Layers,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Combine related routes into groups
const teacherNavGroups = [
  {
    name: "Main",
    items: [
      { name: "Announcements", href: "/dashboard", icon: Megaphone },
      { name: "Students", href: "/students", icon: Users },
      { name: "Classes", href: "/classes", icon: BookOpen },
    ]
  },
  {
    name: "Teaching",
    items: [
      { name: "Assignments", href: "/assignments", icon: FileText },
      { name: "Attendance", href: "/attendance", icon: Calendar },
      { name: "Behavior", href: "/behavior", icon: ChartBar },
      { name: "Resources", href: "/resources", icon: Layers },
    ]
  },
  {
    name: "Rewards",
    items: [
      { name: "Achievements", href: "/achievements", icon: Trophy },
      { name: "Rewards", href: "/rewards", icon: Award },
      { name: "NFT Wallet", href: "/wallet", icon: Wallet },
    ]
  },
  {
    name: "Communication",
    items: [
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "Notifications", href: "/notifications", icon: Bell },
    ]
  },
  {
    name: "Analysis",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

const studentNavGroups = [
  {
    name: "Main",
    items: [
      { name: "Announcements", href: "/dashboard", icon: Megaphone },
      { name: "Classes", href: "/classes", icon: BookOpen },
      { name: "Assignments", href: "/assignments", icon: FileText },
    ]
  },
  {
    name: "Learning",
    items: [
      { name: "Progress", href: "/progress", icon: ChartBar },
      { name: "Resources", href: "/resources", icon: Layers },
    ]
  },
  {
    name: "Rewards",
    items: [
      { name: "Achievements", href: "/achievements", icon: Trophy },
      { name: "My NFTs", href: "/rewards", icon: Award },
      { name: "Wallet", href: "/wallet", icon: Wallet },
    ]
  },
  {
    name: "Communication",
    items: [
      { name: "Messages", href: "/messages", icon: MessageSquare },
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if on main page or routes like /auth that shouldn't have the dashboard layout
  const isMainPage = location.pathname === "/" || location.pathname === "/auth";

  useEffect(() => {
    if (!isMainPage) {
      checkAuth();
    }
  }, [isMainPage]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please log in to access this page"
      });
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(roleData?.role || null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goToHome = () => {
    navigate('/');
  };

  const navGroups = userRole === 'teacher' ? teacherNavGroups : studentNavGroups;

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(147,51,234,0.2),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.15),transparent_70%)]"></div>
        <div className="absolute -z-10 opacity-20">
          <div className="hexagon top-40 left-[20%] w-72 h-72 bg-purple-700/30"></div>
          <div className="hexagon bottom-60 right-[15%] w-96 h-96 bg-purple-600/20"></div>
        </div>
      </div>

      {!isMainPage && (
        <motion.aside
          initial={false}
          animate={{ 
            width: isSidebarOpen ? "18rem" : "0rem",
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed top-0 left-0 z-40 h-screen",
            "bg-black/90 backdrop-blur-xl border-r border-purple-500/20",
            "overflow-hidden"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-5">
              <Link to="/" className="text-2xl font-bold blockward-logo">
                Blockward
              </Link>
            </div>

            <nav className="flex-1 space-y-6 px-4 py-6 overflow-y-auto">
              {navGroups.map((group) => (
                <div key={group.name} className="space-y-3">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.name}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "flex items-center px-4 py-3 rounded-lg",
                            "text-gray-300 hover:bg-purple-900/30",
                            "transition-colors duration-200",
                            "group",
                            isActive && "bg-purple-900/40 text-purple-300 glow-text"
                          )}
                        >
                          <Icon className={cn("mr-3 h-5 w-5", isActive && "text-purple-400")} />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </motion.aside>
      )}

      {!isMainPage && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 p-4 bg-black/90 backdrop-blur-xl border-b border-purple-500/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="bg-purple-900/30 hover:bg-purple-800/40"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-purple-300" />
            ) : (
              <Menu className="h-6 w-6 text-purple-300" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToHome}
            className="bg-purple-900/30 hover:bg-purple-800/40"
          >
            <Home className="h-6 w-6 text-purple-300" />
          </Button>
        </div>
      )}

      <main
        className={cn(
          "transition-all duration-300",
          !isMainPage && "p-8 mt-16",
          !isMainPage && (isSidebarOpen ? "lg:ml-72" : "ml-0")
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};
