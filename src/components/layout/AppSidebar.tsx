import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BookOpen,
  Settings,
  Bell,
  Calendar,
  Wallet,
  BarChart,
  MessageSquare,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChartBar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AppSidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(roleData?.role || null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleNavigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    
    if (path === '/classes') {
      window.location.href = path;
      toast.success("Redirecting to classes...");
      return;
    }
    
    navigate(path);
  };

  const toggleSidebarAndMinimize = () => {
    toggleSidebar();
    setIsMinimized(!isMinimized);
  };

  const teacherNavGroups = [
    {
      name: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Classes", href: "/classes", icon: BookOpen },
      ]
    },
    {
      name: "Teaching",
      items: [
        { name: "Attendance", href: "/attendance", icon: Calendar },
      ]
    },
    {
      name: "Wallet",
      items: [
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
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Classes", href: "/classes", icon: BookOpen },
      ]
    },
    {
      name: "Learning",
      items: [
        { name: "Progress", href: "/progress", icon: ChartBar },
      ]
    },
    {
      name: "Wallet",
      items: [
        { name: "NFT Wallet", href: "/wallet", icon: Wallet },
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

  const navGroups = userRole === 'teacher' ? teacherNavGroups : studentNavGroups;
  
  return (
    <>
      <div className={cn(
        "fixed top-4 z-50 flex items-center justify-center",
        isMinimized ? "left-4" : "left-[248px]",
        "transition-all duration-300"
      )}>
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={toggleSidebarAndMinimize}
          className="h-8 w-8 rounded-full bg-purple-900 border border-purple-500/30 hover:bg-purple-800 shadow-lg"
        >
          {isMinimized ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Sidebar className={cn(
        "bg-gradient-to-b from-[#25293A] to-[#1A1F2C] border-r border-purple-500/30 shadow-xl fixed top-0 left-0 h-screen z-40 flex flex-col", 
        isMinimized ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full w-full">
          <SidebarHeader className="flex items-center px-6 py-6">
            {!isMinimized && (
              <div 
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 cursor-pointer" 
                onClick={() => handleNavigate('/dashboard')}
              >
                BlockWard
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="flex-1 overflow-y-auto w-full">
            {navGroups.map((group) => (
              <SidebarGroup key={group.name} className="w-full">
                {!isMinimized && (
                  <SidebarGroupLabel className="text-gray-300 font-semibold px-4">{group.name}</SidebarGroupLabel>
                )}
                <SidebarGroupContent className="w-full">
                  <SidebarMenu className="w-full">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;
                      
                      if (item.href === '/classes') {
                        return (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton 
                              asChild 
                              isActive={isActive}
                              tooltip={isMinimized ? item.name : undefined}
                              className={cn(
                                "p-3 rounded-lg hover:bg-purple-700/30 transition-all duration-300 w-full",
                                isActive && "bg-purple-600/40 shadow-lg border border-purple-500/30"
                              )}
                            >
                              <a 
                                href="/classes"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleNavigate('/classes');
                                }}
                                className={cn(
                                  "cursor-pointer flex items-center w-full",
                                  isActive ? "text-white font-semibold" : "text-gray-300"
                                )}
                              >
                                <Icon className={cn("w-5 h-5", isActive && "text-purple-300")} />
                                {!isMinimized && <span className="ml-3">{item.name}</span>}
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      }
                      
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            tooltip={isMinimized ? item.name : undefined}
                            className={cn(
                              "p-3 rounded-lg hover:bg-purple-700/30 transition-all duration-300 w-full",
                              isActive && "bg-purple-600/40 shadow-lg border border-purple-500/30"
                            )}
                          >
                            <div 
                              onClick={() => handleNavigate(item.href)} 
                              className={cn(
                                "cursor-pointer flex items-center w-full",
                                isActive ? "text-white font-semibold" : "text-gray-300"
                              )}
                            >
                              <Icon className={cn("w-5 h-5", isActive && "text-purple-300")} />
                              {!isMinimized && <span className="ml-3">{item.name}</span>}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          
          <SidebarFooter className="mt-auto px-4 py-4">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300",
                !isMinimized && "justify-start"
              )}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              {!isMinimized && <span className="ml-3">Logout</span>}
            </Button>
          </SidebarFooter>
        </div>
      </Sidebar>
    </>
  );
}
