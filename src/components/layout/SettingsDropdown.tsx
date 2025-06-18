
import React, { useState, useRef, useEffect } from 'react';
import { Settings, User, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/useLogout';

export const SettingsDropdown = () => {
  const navigate = useNavigate();
  const { handleLogout } = useLogout();

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
          aria-label="Settings menu"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-gray-900/95 backdrop-blur-md border-purple-500/30 text-white"
        sideOffset={5}
      >
        <DropdownMenuItem 
          onClick={handleProfileClick}
          className="flex items-center gap-2 cursor-pointer hover:bg-purple-900/40 focus:bg-purple-900/40"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleAdminClick}
          className="flex items-center gap-2 cursor-pointer hover:bg-purple-900/40 focus:bg-purple-900/40"
        >
          <Shield className="h-4 w-4" />
          <span>Admin Controls</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-purple-500/30" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer hover:bg-red-900/40 focus:bg-red-900/40 text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
