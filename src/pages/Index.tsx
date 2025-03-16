
import React, { useState } from 'react';
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

const Index = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  
  const handleSignUp = () => {
    navigate('/auth');
  };
  
  const handleEnterSite = () => {
    setShowIntro(false);
  };
  
  if (showIntro) {
    return <BlockwardIntro onEnter={handleEnterSite} />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <NavBar />
      
      {/* Hero section */}
      <Hero />
      
      {/* How easy to use section */}
      <EasyToUse />
      
      {/* Preview section */}
      <ClassroomPreview />
      
      {/* About Section with ID for scrolling */}
      <div id="about">
        <AboutSection />
      </div>
      
      {/* Features section */}
      <Features />
      
      {/* Contact Section */}
      <ContactSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
