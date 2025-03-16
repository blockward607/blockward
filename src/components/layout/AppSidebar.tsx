
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
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BookOpen,
  Award,
  Settings,
  Bell,
  Calendar,
  ChartBar,
  Trophy,
  Wallet,
  BarChart,
  MessageSquare,
  LogOut,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get user role
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

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  // Combine related routes into groups
  const teacherNavGroups = [
    {
      name: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Students", href: "/students", icon: Users },
        { name: "Classes", href: "/classes", icon: BookOpen },
      ]
    },
    {
      name: "Teaching",
      items: [
        { name: "Attendance", href: "/attendance", icon: Calendar },
        { name: "Behavior", href: "/behavior", icon: ChartBar },
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

  const navGroups = userRole === 'teacher' ? teacherNavGroups : studentNavGroups;
  
  // Extract main navigation items and place them at the top
  const mainNavItems = navGroups[0].items || [];

  return (
    <Sidebar className={cn(
      "bg-gradient-to-b from-[#25293A] to-[#1A1F2C] border-r border-purple-500/30 shadow-xl fixed top-0 left-0 h-screen z-40", 
      isMinimized ? "w-16" : "w-64"
    )}>
      <div className="absolute top-4 right-0 z-10 transform translate-x-1/2">
        <Button 
          size="icon" 
          variant="secondary" 
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-full bg-purple-900 border border-purple-500/30 hover:bg-purple-800"
        >
          {isMinimized ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex flex-col h-full w-full">
        <SidebarHeader className="flex items-center px-6 py-6">
          {!isMinimized && (
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600" onClick={() => navigate('/')}>
              Blockward
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent className="flex-1 overflow-y-auto w-full">
          {/* Main navigation items at the top */}
          <SidebarMenu className="px-2 mt-2 mb-6 w-full">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.href;
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
                      onClick={() => navigate(item.href)} 
                      className={cn(
                        "cursor-pointer flex items-center w-full",
                        isActive ? "text-white font-semibold" : "text-gray-300"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "text-purple-300")} />
                      {!isMinimized && <span className="ml-3">{item.name}</span>}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          
          {/* Display rest of the navigation groups */}
          {navGroups.slice(1).map((group) => (
            <SidebarGroup key={group.name} className="w-full">
              {!isMinimized && (
                <SidebarGroupLabel className="text-gray-300 font-semibold px-4">{group.name}</SidebarGroupLabel>
              )}
              <SidebarGroupContent className="w-full">
                <SidebarMenu className="w-full">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name} className="w-full">
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
                            onClick={() => navigate(item.href)} 
                            className={cn(
                              "cursor-pointer flex items-center w-full",
                              isActive ? "text-white font-semibold" : "text-gray-300"
                            )}
                          >
                            <item.icon className={cn("w-5 h-5", isActive && "text-purple-300")} />
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
        
        <SidebarFooter className="p-4 w-full">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-red-500/20",
              isMinimized && "px-2 justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!isMinimized && <span className="text-base">Log Out</span>}
          </Button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
