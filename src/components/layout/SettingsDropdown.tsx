
import { useState, useRef, useEffect } from "react";
import { Settings, User, Shield, LogOut, Building, Users, BookOpen } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Settings dropdown toggled:', !isOpen);
    setIsOpen(prev => !prev);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout clicked');
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          variant: "destructive",
          title: "Error logging out",
          description: error.message || "There was a problem logging out of your account",
        });
        return;
      }

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
      
      navigate('/auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "There was a problem logging out of your account",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Profile clicked');
    navigate('/settings');
    setIsOpen(false);
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Admin clicked, user role:', userRole);
    
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'teacher') {
      navigate('/teacher-admin');
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access admin features",
      });
    }
    setIsOpen(false);
  };

  const handleStudentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Students clicked');
    navigate('/students');
    setIsOpen(false);
  };

  const handleClassesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Classes clicked');
    navigate('/classes');
    setIsOpen(false);
  };

  const handleSchoolClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('School setup clicked');
    navigate('/school-setup');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        disabled={isLoading}
        className="bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 transition-all duration-200 hover:scale-105 relative z-20"
        type="button"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 top-full mt-2 w-56 z-[200]",
          "bg-black/95 backdrop-blur-xl border border-purple-500/20 rounded-lg shadow-2xl",
          "animate-in slide-in-from-top-2 duration-200"
        )}>
          <div className="py-2">
            {/* Quick Actions */}
            {userRole === 'teacher' && (
              <>
                <button
                  onClick={handleStudentsClick}
                  className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer"
                  type="button"
                >
                  <Users className="h-4 w-4 mr-3" />
                  <span>Manage Students</span>
                </button>
                <button
                  onClick={handleClassesClick}
                  className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer"
                  type="button"
                >
                  <BookOpen className="h-4 w-4 mr-3" />
                  <span>My Classes</span>
                </button>
                <button
                  onClick={handleSchoolClick}
                  className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer"
                  type="button"
                >
                  <Building className="h-4 w-4 mr-3" />
                  <span>School Setup</span>
                </button>
                <div className="border-t border-purple-500/20 my-1"></div>
              </>
            )}

            {/* Profile & Settings */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer"
              type="button"
            >
              <User className="h-4 w-4 mr-3" />
              <span>Profile & Settings</span>
            </button>

            {/* Admin Controls */}
            {(userRole === 'admin' || userRole === 'teacher') && (
              <button
                onClick={handleAdminClick}
                className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-purple-900/30 hover:text-purple-300 transition-colors cursor-pointer"
                type="button"
              >
                <Shield className="h-4 w-4 mr-3" />
                <span>
                  {userRole === 'admin' ? 'Admin Dashboard' : 'Teacher Admin'}
                </span>
              </button>
            )}

            <div className="border-t border-purple-500/20 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
              type="button"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
