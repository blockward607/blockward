
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface SidebarToggleButtonProps {
  isMinimized: boolean;
  onToggle: () => void;
}

export const SidebarToggleButton: FC<SidebarToggleButtonProps> = ({ 
  isMinimized, 
  onToggle 
}) => {
  return (
    <div className={cn(
      "fixed top-4 z-50 flex items-center justify-center",
      isMinimized ? "left-4" : "left-[248px]",
      "transition-all duration-300"
    )}>
      <Button 
        size="icon" 
        variant="secondary" 
        onClick={onToggle}
        className="h-8 w-8 rounded-full bg-purple-900 border border-purple-500/30 hover:bg-purple-800 shadow-lg"
      >
        {isMinimized ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
};
