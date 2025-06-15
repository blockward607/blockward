
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Megaphone,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Wallet,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    if (path === '/classes') {
      window.history.pushState({}, '', path);
      navigate(path, { replace: true });
    } else {
      navigate(path);
    }
  };

  const toggleSidebarAndMinimize = () => {
    toggleSidebar();
    setIsMinimized(!isMinimized);
  };

  // Flat list of nav items for students and teachers, no group headers
  const teacherNav = [
    { name: "Announcements", href: "/dashboard", icon: Megaphone },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "Attendance", href: "/attendance", icon: Calendar },
    { name: "NFT Wallet", href: "/wallet", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];
  const studentNav = [
    { name: "Announcements", href: "/dashboard", icon: Megaphone },
    { name: "Classes", href: "/classes", icon: BookOpen },
    { name: "NFT Wallet", href: "/wallet", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];
  const navItems = userRole === 'teacher' ? teacherNav : studentNav;
  
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
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 cursor-pointer select-none" 
                onClick={() => handleNavigate('/dashboard')}
              >
                BlockWard
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="flex-1 overflow-y-auto w-full">
            <SidebarGroup className={cn("w-full")}>
              <SidebarGroupContent className="w-full">
                {/* Visual container for nav buttons - glassy/card effect */}
                <div
                  className={cn(
                    "w-[90%] mx-auto mt-2 flex flex-col gap-2 rounded-2xl shadow-2xl border border-purple-700/30",
                    "bg-gradient-to-br from-purple-800/30 via-transparent to-purple-950/50 backdrop-blur-sm",
                    "p-2 sm:p-3 transition-all duration-300"
                  )}
                >
                  <SidebarMenu className="w-full flex flex-col gap-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            tooltip={isMinimized ? item.name : undefined}
                            className={cn(
                              "p-3 rounded-xl hover:bg-purple-700/30 transition-all duration-300 w-full",
                              isActive && "bg-purple-600/50 shadow-lg border border-purple-400/40 scale-[1.02]",
                              "outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60",
                              "flex items-center"
                            )}
                          >
                            <div 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNavigate(item.href);
                              }} 
                              className={cn(
                                "cursor-pointer flex items-center w-full",
                                isActive ? "text-white font-semibold" : "text-gray-200"
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
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
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
