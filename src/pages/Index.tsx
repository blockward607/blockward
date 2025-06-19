import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { NFTShowcase } from '@/components/NFTShowcase';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-white">
              BlockWard
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
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
