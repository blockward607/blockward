
import { FC } from "react";
import { cn } from "@/lib/utils";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useNavigation, NavItem } from "./useNavigation";
import * as LucideIcons from "lucide-react";

interface SidebarNavItemProps {
  item: NavItem;
  isMinimized: boolean;
}

export const SidebarNavItem: FC<SidebarNavItemProps> = ({ item, isMinimized }) => {
  const { handleNavigation, isActiveRoute } = useNavigation();
  const isActive = isActiveRoute(item.href);
  
  // Fix: Use type assertion to correctly access the icon component from Lucide
  const IconComponent = item.icon ? 
    (LucideIcons[item.icon as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>) : 
    null;

  return (
    <SidebarMenuItem>
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
          onClick={() => handleNavigation(item.href)} 
          className={cn(
            "cursor-pointer flex items-center w-full",
            isActive ? "text-white font-semibold" : "text-gray-300"
          )}
        >
          {IconComponent && <IconComponent className={cn("w-5 h-5", isActive && "text-purple-300")} />}
          {!isMinimized && <span className="ml-3">{item.name}</span>}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
