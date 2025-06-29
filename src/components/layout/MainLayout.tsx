
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  BookOpen,
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
  Megaphone,
  Shield,
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingsDropdown } from "./SettingsDropdown";

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
    name: "Account",
    items: [
      { name: "NFT Wallet", href: "/wallet", icon: Wallet },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  },
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
    name: "Account",
    items: [
      { name: "NFT Wallet", href: "/wallet", icon: Wallet },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  },
];

// Admin nav groups
const adminNavGroups = [
  {
    name: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: BarChart },
      { name: "Analytics", href: "/admin/analytics", icon: ChartBar },
    ]
  },
  {
    name: "Management",
    items: [
      { name: "Teachers", href: "/admin/teachers", icon: Shield },
      { name: "Students", href: "/admin/students", icon: Users },
      { name: "Classes", href: "/admin/classes", icon: BookOpen },
    ]
  },
  {
    name: "School",
    items: [
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { name: "NFT Management", href: "/admin/rewards", icon: Wallet },
    ]
  },
];

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if on main page, auth routes, or admin routes that shouldn't have the dashboard layout
  const isMainPage = location.pathname === "/" || location.pathname === "/auth";
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isMainPage) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [isMainPage]);

  const checkAuth = async () => {
    try {
      setLoading(true);
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

      const role = roleData?.role || null;
      setUserRole(role);

      // Redirect admin users to admin dashboard if they're on regular dashboard
      if (role === 'admin' && location.pathname === '/dashboard') {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to verify authentication"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    console.log('Sidebar toggled:', !isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goToHome = () => {
    console.log('Home button clicked');
    navigate('/');
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "There was a problem logging out of your account",
      });
    }
  };

  // Select nav groups based on role and route
  let navGroups;
  if (isAdminRoute && userRole === 'admin') {
    navGroups = adminNavGroups;
  } else if (userRole === 'teacher') {
    navGroups = teacherNavGroups;
  } else {
    navGroups = studentNavGroups;
  }

  if (loading && !isMainPage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

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
                {isAdminRoute && (
                  <span className="text-sm text-purple-400 block">Admin</span>
                )}
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
                          onClick={() => console.log('Nav item clicked:', item.name)}
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

            <div className="px-4 pb-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full flex items-center justify-start px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </motion.aside>
      )}

      {!isMainPage && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black/90 backdrop-blur-xl border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="bg-purple-900/30 hover:bg-purple-800/40 transition-all duration-200 hover:scale-105"
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
              className="bg-purple-900/30 hover:bg-purple-800/40 transition-all duration-200 hover:scale-105"
            >
              <Home className="h-6 w-6 text-purple-300" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 transition-all duration-200 hover:scale-105"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <SettingsDropdown userRole={userRole} />
          </div>
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
