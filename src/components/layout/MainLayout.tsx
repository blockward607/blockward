
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
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const teacherNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Students", href: "/students", icon: Users },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: FileText },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Behavior", href: "/behavior", icon: ChartBar },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Resources", href: "/resources", icon: Layers },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Rewards", href: "/rewards", icon: Award },
  { name: "NFT Wallet", href: "/wallet", icon: Wallet },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: FileText },
  { name: "Progress", href: "/progress", icon: ChartBar },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Resources", href: "/resources", icon: Layers },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "My NFTs", href: "/rewards", icon: Award },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

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

    // Get user role
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

  const navigation = userRole === 'teacher' ? teacherNavigation : studentNavigation;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? "16rem" : "0rem",
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen",
          "bg-black/50 backdrop-blur-xl border-r border-white/10",
          "overflow-hidden"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-2xl font-bold gradient-text">
              Blockward
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg",
                    "text-gray-300 hover:bg-white/10",
                    "transition-colors duration-200",
                    "group",
                    isActive && "bg-purple-600/20 text-purple-400"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 p-4 bg-black/50 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-black/50 backdrop-blur-xl"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToHome}
          className="bg-black/50 backdrop-blur-xl"
        >
          <Home className="h-6 w-6" />
        </Button>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300 p-8 mt-16",
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};
