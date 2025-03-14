
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
  FileText,
  BarChart,
  MessageSquare,
  Layers,
  LogOut
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
        { name: "Dashboard", href: "/dashboard", icon: Home },
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

  const navGroups = userRole === 'teacher' ? teacherNavGroups : studentNavGroups;

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-6 py-4">
        <div className="text-xl font-bold gradient-text" onClick={() => navigate('/')}>
          Blockward
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <div 
                          onClick={() => navigate(item.href)} 
                          className={cn(
                            "cursor-pointer",
                            isActive && "text-purple-400"
                          )}
                        >
                          <item.icon />
                          <span>{item.name}</span>
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
      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
