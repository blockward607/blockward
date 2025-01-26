import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Students", href: "/students", icon: Users },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Behavior", href: "/behavior", icon: ChartBar },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Rewards", href: "/rewards", icon: Award },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

const SIDEBAR_STATE_KEY = 'sidebar-state';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved ? JSON.parse(saved) : true;
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64",
          "bg-black/50 backdrop-blur-xl border-r border-white/10"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4">
            <Link to="/" className="text-2xl font-bold gradient-text">
              Blockward
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
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
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "bg-black/50 backdrop-blur-xl", 
            isSidebarOpen && "hidden"
          )}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300 p-8",
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
};