
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { NavBar } from "@/components/layout/NavBar";
import { AboutSection } from "@/components/about/AboutSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";
import { ClassroomPreview } from "@/components/preview/ClassroomPreview";

const Index = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <NavBar />
      
      {/* Hero section */}
      <Hero />
      
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
