
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  Settings, 
  LogOut,
  School,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSchoolAdmin } from "@/hooks/useSchoolAdmin";
import { useLogout } from "@/hooks/useLogout";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useSchoolAdmin();
  const { handleLogout } = useLogout();

  const studentItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Classes", url: "/classes", icon: BookOpen },
    { title: "Achievements", url: "/achievements", icon: Award },
    { title: "Wallet", url: "/wallet", icon: Award },
  ];

  const teacherItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Classes", url: "/classes", icon: BookOpen },
    { title: "Students", url: "/students", icon: Users },
    { title: "Attendance", url: "/attendance", icon: Calendar },
    { title: "Grades", url: "/grades", icon: Award },
    { title: "Rewards", url: "/rewards", icon: Award },
  ];

  const adminItems = [
    { title: "Admin Dashboard", url: "/school-admin", icon: School },
    { title: "User Management", url: "/school-admin?tab=users", icon: Users },
    { title: "Timetable", url: "/school-admin?tab=timetable", icon: Calendar },
    { title: "Classes", url: "/school-admin?tab=classes", icon: BookOpen },
    { title: "Reports", url: "/school-admin?tab=reports", icon: Award },
    { title: "School Settings", url: "/school-admin?tab=settings", icon: Settings },
  ];

  const [userRole, setUserRole] = useState<string | null>(null);

  // Determine user role
  useState(() => {
    if (user) {
      if (user.user_metadata?.role) {
        setUserRole(user.user_metadata.role);
      } else {
        // Fallback to checking auth claims
        const claims = user.app_metadata?.claims;
        if (claims?.includes('teacher')) {
          setUserRole('teacher');
        } else if (claims?.includes('student')) {
          setUserRole('student');
        }
      }
    }
  });

  const getMenuItems = () => {
    if (isAdmin) {
      return adminItems;
    }
    // Keep existing teacher/student logic
    return user?.user_metadata?.role === 'student' ? studentItems : teacherItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900/50">
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white">Blockward</h2>
            {isAdmin && (
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">School Admin</span>
              </div>
            )}
          </div>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url.split('?')[0]}
                    className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {!isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/settings")}
                    isActive={location.pathname === "/settings"}
                    className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
