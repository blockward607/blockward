
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { NavBar } from "@/components/layout/NavBar";
import { AboutSection } from "@/components/about/AboutSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { BlockwardIntro } from "@/components/intro/BlockwardIntro";

interface IndexProps {
  showIntro?: boolean;
}

const Index = ({ showIntro }: IndexProps = { showIntro: true }) => {
  const navigate = useNavigate();
  const [showingIntro, setShowingIntro] = useState(showIntro !== false);
  
  const handleSignUp = () => {
    navigate('/auth');
  };
  
  // By default, show the intro screen unless showIntro is explicitly set to false
  if (showingIntro) {
    return <BlockwardIntro onEnter={() => setShowingIntro(false)} />;
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
