
import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useLogout';

export const SettingsDropdown = () => {
  const navigate = useNavigate();
  const { handleLogout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-purple-300 hover:text-white hover:bg-purple-800/50 transition-all duration-200 border border-purple-500/30 rounded-lg px-3 py-2"
        aria-label="Settings menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Settings</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-purple-500/40 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
            <p className="text-sm font-medium text-white">Account Settings</p>
            <p className="text-xs text-gray-400">Manage your preferences</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-purple-900/40 hover:text-white transition-all duration-150 group"
            >
              <div className="p-1.5 rounded-lg bg-purple-600/20 group-hover:bg-purple-600/30 transition-colors">
                <User className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <span className="text-sm font-medium">Profile</span>
                <p className="text-xs text-gray-400">Edit your profile settings</p>
              </div>
            </button>

            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-blue-900/40 hover:text-white transition-all duration-150 group"
            >
              <div className="p-1.5 rounded-lg bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors">
                <Shield className="h-4 w-4 text-blue-300" />
              </div>
              <div>
                <span className="text-sm font-medium">Admin Controls</span>
                <p className="text-xs text-gray-400">Administrative tools</p>
              </div>
            </button>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mx-4" />

          {/* Logout */}
          <div className="py-2">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-red-900/40 hover:text-red-300 transition-all duration-150 group"
            >
              <div className="p-1.5 rounded-lg bg-red-600/20 group-hover:bg-red-600/30 transition-colors">
                <LogOut className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <span className="text-sm font-medium">Sign Out</span>
                <p className="text-xs text-gray-400">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
