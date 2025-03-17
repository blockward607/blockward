
import { FC } from "react";
import { SidebarHeader as Header } from "@/components/ui/sidebar";
import { useNavigation } from "./useNavigation";

interface SidebarHeaderProps {
  isMinimized: boolean;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ isMinimized }) => {
  const { handleNavigation } = useNavigation();

  return (
    <Header className="flex items-center px-6 py-6">
      {!isMinimized && (
        <div 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 cursor-pointer" 
          onClick={() => handleNavigation('/')}
        >
          BlockWard
        </div>
      )}
    </Header>
  );
};
