
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, BookOpen, Phone, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiamondLogo } from "@/components/logo/DiamondLogo";

export const NavBar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Sign In button clicked (NavBar) - navigating to /auth');
    setMobileMenuOpen(false);
    navigate('/auth');
  };
  
  const handleAdminPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Admin Panel button clicked (NavBar) - navigating to /admin-login');
    setMobileMenuOpen(false);
    navigate('/admin-login');
  };
  
  const handleHome = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Logo/Home clicked (NavBar) - navigating to /');
    navigate('/');
  };
  
  const scrollToSection = (sectionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log(`🔥 Scrolling to section: ${sectionId}`);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    } else {
      console.warn(`Section ${sectionId} not found, trying alternative selectors`);
      // Try alternative ways to find sections
      const alternativeSection = document.querySelector(`[data-section="${sectionId}"], [class*="${sectionId}"]`);
      if (alternativeSection) {
        alternativeSection.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-900/20">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
          <DiamondLogo size={32} />
          <h1 className="text-3xl blockward-logo">BlockWard</h1>
        </div>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            type="button"
            onClick={(e) => scrollToSection('home', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button 
            type="button"
            onClick={(e) => scrollToSection('about', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>About</span>
          </button>
          <button 
            type="button"
            onClick={(e) => scrollToSection('preview', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button 
            type="button"
            onClick={(e) => scrollToSection('contact', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Contact</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Button 
              type="button"
              onClick={handleSignIn}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              Sign In
            </Button>
            
            <Button 
              type="button"
              onClick={handleAdminPanel}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Button>
          </div>
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-purple-400 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-purple-900/20 py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <button 
            type="button"
            onClick={(e) => scrollToSection('home', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button 
            type="button"
            onClick={(e) => scrollToSection('about', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2 cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span>About</span>
          </button>
          <button 
            type="button"
            onClick={(e) => scrollToSection('preview', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Preview</span>
          </button>
          <button 
            type="button"
            onClick={(e) => scrollToSection('contact', e)} 
            className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2 py-2 cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span>Contact</span>
          </button>
          
          <div className="flex flex-col gap-3 pt-2 border-t border-purple-900/20">
            <Button 
              type="button"
              onClick={handleSignIn}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 justify-start cursor-pointer"
            >
              Sign In
            </Button>
            
            <Button 
              type="button"
              onClick={handleAdminPanel}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 cursor-pointer"
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
