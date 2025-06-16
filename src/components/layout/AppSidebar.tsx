
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
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Megaphone,
  LogOut,
  Wallet,
  Calendar,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    <Sidebar className="bg-gradient-to-b from-[#25293A] to-[#1A1F2C] border-r border-purple-500/30">
      <SidebarHeader className="flex items-center px-6 py-6">
        <div 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 cursor-pointer select-none" 
          onClick={() => handleNavigate('/dashboard')}
        >
          BlockWard
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "p-3 rounded-xl hover:bg-purple-700/30 transition-all duration-300",
                        isActive && "bg-purple-600/50 shadow-lg border border-purple-400/40"
                      )}
                    >
                      <div 
                        onClick={() => handleNavigate(item.href)} 
                        className={cn(
                          "cursor-pointer flex items-center w-full",
                          isActive ? "text-white font-semibold" : "text-gray-200"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isActive && "text-purple-300")} />
                        <span className="ml-3">{item.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-4 py-4">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-start p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
