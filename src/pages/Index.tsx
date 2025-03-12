
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { NavBar } from "@/components/layout/NavBar";
import { AboutSection } from "@/components/about/AboutSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { BlockwardIntro } from "@/components/intro/BlockwardIntro";

const Index = () => {
  const navigate = useNavigate();
  const [showingIntro, setShowingIntro] = useState(true);
  
  const handleSignUp = () => {
    navigate('/auth');
  };
  
  // By default, show the intro screen
  if (showingIntro) {
    return <BlockwardIntro />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <NavBar />
      
      {/* Hero section with integrated Demo Access */}
      <Hero />
      
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
