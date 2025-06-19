
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, BookOpen, Phone, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiamondLogo } from "@/components/logo/DiamondLogo";

export const NavBar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignIn = () => {
    setMobileMenuOpen(false);
    navigate('/auth');
  };
  
  const handleAdminPanel = () => {
    setMobileMenuOpen(false);
    navigate('/admin-login');
  };
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-900/20">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <DiamondLogo size={32} />
          <h1 className="text-3xl blockward-logo">BlockWard</h1>
        </div>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => scrollToSection('home')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>About</span>
          </button>
          <button 
            onClick={() => scrollToSection('preview')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Contact</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSignIn}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300"
            >
              Sign In
            </Button>
            
            <Button 
              onClick={handleAdminPanel}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Button>
          </div>
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-purple-400"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-purple-900/20 py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <button 
            onClick={() => scrollToSection('home')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button 
            onClick={() => scrollToSection('about')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2"
          >
            <User className="w-5 h-5" />
            <span>About</span>
          </button>
          <button 
            onClick={() => scrollToSection('preview')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>Preview</span>
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2"
          >
            <Phone className="w-5 h-5" />
            <span>Contact</span>
          </button>
          
          <div className="flex flex-col gap-3 pt-2 border-t border-purple-900/20">
            <Button 
              onClick={handleSignIn}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 justify-start"
            >
              Sign In
            </Button>
            
            <Button 
              onClick={handleAdminPanel}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
