
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { NavBar } from "@/components/layout/NavBar";
import { AboutSection } from "@/components/about/AboutSection";
import { DemoAccessSection } from "@/components/demo/DemoAccessSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <NavBar />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Easy Access Demo Section */}
      <DemoAccessSection />
      
      {/* Hero section */}
      <Hero />
      
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
