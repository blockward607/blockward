
import { FC } from "react";
import { cn } from "@/lib/utils";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu } from "@/components/ui/sidebar";
import { SidebarNavItem } from "./SidebarNavItem";
import { NavGroup } from "./useNavigation";

interface SidebarNavGroupProps {
  group: NavGroup;
  isMinimized: boolean;
  isMainGroup?: boolean;
}

export const SidebarNavGroup: FC<SidebarNavGroupProps> = ({ 
  group, 
  isMinimized,
  isMainGroup = false 
}) => {
  return (
    <SidebarGroup key={group.name} className="w-full">
      {!isMinimized && !isMainGroup && (
        <SidebarGroupLabel className="text-gray-300 font-semibold px-4">
          {group.name}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent className="w-full">
        <SidebarMenu className={cn(
          "w-full",
          isMainGroup ? "px-2 mt-2 mb-6" : ""
        )}>
          {group.items.map((item) => (
            <SidebarNavItem 
              key={item.name} 
              item={item} 
              isMinimized={isMinimized} 
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
