
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, BookOpen, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveLogo } from "@/components/logo/InteractiveLogo";

export const NavBar = () => {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth');
  };
  
  const handleSignUp = () => {
    navigate('/signup');
  };
  
  return (
    <header className="container mx-auto py-6 px-4 flex justify-between items-center border-b border-purple-900/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10">
          <InteractiveLogo />
        </div>
        <h1 className="text-3xl blockward-logo">Blockward</h1>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </a>
        <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>About</span>
        </a>
        <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Features</span>
        </a>
        <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>Contact</span>
        </a>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSignIn}
            variant="ghost"
            className="text-purple-400 hover:text-purple-300"
          >
            Sign In
          </Button>
          
          <Button 
            onClick={handleSignUp}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          >
            Sign Up
          </Button>
        </div>
      </nav>
      
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center gap-2">
        <Button 
          onClick={handleSignIn}
          variant="ghost"
          className="text-purple-400 hover:text-purple-300"
        >
          Sign In
        </Button>
        
        <Button 
          onClick={handleSignUp}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
        >
          Sign Up
        </Button>
      </div>
    </header>
  );
};
