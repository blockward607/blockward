
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, BookOpen, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveLogo } from "@/components/logo/InteractiveLogo";

export const NavBar = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth');
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
        <Button 
          onClick={handleSignUp}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
        >
          Sign Up
        </Button>
      </nav>
      
      {/* Mobile menu button */}
      <button className="md:hidden text-gray-300 hover:text-purple-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
};
