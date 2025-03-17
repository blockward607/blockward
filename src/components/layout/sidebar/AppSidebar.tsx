
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { useNavigation } from "./useNavigation";

export function AppSidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toggleSidebar } = useSidebar();
  const { teacherNavGroups, studentNavGroups } = useNavigation();

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

  const handleToggleSidebar = () => {
    setIsMinimized(!isMinimized);
    toggleSidebar();
  };

  const navGroups = userRole === 'teacher' ? teacherNavGroups : studentNavGroups;
  const mainNavGroup = navGroups[0];
  const otherNavGroups = navGroups.slice(1);

  return (
    <>
      <SidebarToggleButton 
        isMinimized={isMinimized} 
        onToggle={handleToggleSidebar} 
      />

      <Sidebar className={cn(
        "bg-gradient-to-b from-[#25293A] to-[#1A1F2C] border-r border-purple-500/30 shadow-xl fixed top-0 left-0 h-screen z-40 flex flex-col", 
        isMinimized ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full w-full">
          <SidebarHeader isMinimized={isMinimized} />
          
          <SidebarContent className="flex-1 overflow-y-auto w-full">
            <SidebarNavGroup 
              group={mainNavGroup} 
              isMinimized={isMinimized} 
              isMainGroup={true} 
            />
            
            {otherNavGroups.map((group) => (
              <SidebarNavGroup 
                key={group.name}
                group={group} 
                isMinimized={isMinimized} 
              />
            ))}
          </SidebarContent>
          
          <SidebarFooter isMinimized={isMinimized} />
        </div>
      </Sidebar>
    </>
  );
}
