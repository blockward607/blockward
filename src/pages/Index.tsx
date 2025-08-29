
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { NFTShowcase } from '@/components/NFTShowcase';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Sign In button clicked (Index) - navigating to /auth');
    navigate('/auth');
  };

  const handleAdminPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Admin Panel button clicked (Index) - navigating to /auth');
    navigate('/auth');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Logo clicked (Index) - navigating to /');
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              type="button"
              onClick={handleLogoClick}
              className="text-2xl font-bold text-white cursor-pointer hover:text-purple-400 transition-colors relative z-20"
            >
              BlockWard
            </button>
            <div className="flex items-center gap-4">
              <Button 
                type="button"
                variant="outline" 
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white cursor-pointer relative z-20"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                type="button"
                variant="secondary"
                className="flex items-center gap-2 cursor-pointer relative z-20"
                onClick={handleAdminPanel}
              >
                <Shield className="h-4 w-4" />
                Admin Access
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <NFTShowcase />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
