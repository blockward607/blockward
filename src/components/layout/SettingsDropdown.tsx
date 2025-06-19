
import { useState, useRef, useEffect } from "react";
import { Settings, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SettingsDropdownProps {
  userRole?: string | null;
}

export const SettingsDropdown = ({ userRole }: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "There was a problem logging out of your account",
      });
    }
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="bg-purple-900/30 hover:bg-purple-800/40 text-purple-300"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 top-full mt-2 w-48 z-50",
          "bg-black/95 backdrop-blur-xl border border-purple-500/20 rounded-lg shadow-lg",
          "animate-in slide-in-from-top-2 duration-200"
        )}>
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors"
            >
              <User className="h-4 w-4 mr-3" />
              <span>Profile & Settings</span>
            </button>

            {(userRole === 'admin' || userRole === 'teacher') && (
              <button
                onClick={handleAdminClick}
                className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors"
              >
                <Shield className="h-4 w-4 mr-3" />
                <span>Admin Controls</span>
              </button>
            )}

            <div className="border-t border-purple-500/20 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
