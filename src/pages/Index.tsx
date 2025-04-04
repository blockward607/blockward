
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { NavBar } from "@/components/layout/NavBar";
import { AboutSection } from "@/components/about/AboutSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { ClassroomPreview } from "@/components/preview/ClassroomPreview";
import { EasyToUse } from "@/components/EasyToUse";
import { BlockwardIntro } from '@/components/intro/BlockwardIntro';
import { HowItWorks } from '@/components/HowItWorks';
import { AccessDemoButtons } from '@/components/demo/AccessDemoButtons';

const Index = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    // Check if intro has been shown before
    const introShown = localStorage.getItem('introShown');
    // Reset intro shown flag for testing - remove in production
    // localStorage.removeItem('introShown');
    
    if (introShown) {
      setShowIntro(false);
    }
  }, []);
  
  const handleEnterSite = () => {
    setShowIntro(false);
    localStorage.setItem('introShown', 'true');
  };
  
  if (showIntro) {
    return <BlockwardIntro onEnter={handleEnterSite} />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <NavBar />
      
      {/* Hero section */}
      <div id="home" className="pt-20">
        <Hero />
      </div>
      
      {/* Demo access buttons */}
      <div className="container mx-auto px-4 py-12">
        <AccessDemoButtons />
      </div>
      
      {/* How it works section */}
      <HowItWorks />
      
      {/* How easy to use section */}
      <EasyToUse />
      
      {/* Preview section */}
      <div id="preview" className="classroom-preview scroll-mt-20">
        <ClassroomPreview />
      </div>
      
      {/* About Section with ID for scrolling */}
      <div id="about" className="scroll-mt-20">
        <AboutSection />
      </div>
      
      {/* Features section */}
      <div id="features" className="scroll-mt-20">
        <Features />
      </div>
      
      {/* Contact Section */}
      <div id="contact" className="scroll-mt-20">
        <ContactSection />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
