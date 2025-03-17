
import { FC } from "react";
import { SidebarFooter as Footer } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

interface SidebarFooterProps {
  isMinimized: boolean;
}

export const SidebarFooter: FC<SidebarFooterProps> = ({ isMinimized }) => {
  const { handleLogout } = useLogout();

  return (
    <Footer className="mt-auto px-4 py-4">
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
    </Footer>
  );
};
