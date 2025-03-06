import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Hero from '@/components/layout/Hero';
import Features from '@/components/layout/Features';
import Testimonials from '@/components/layout/Testimonials';
import Footer from '@/components/layout/Footer';

const Index = () => {
  const navigate = useNavigate();
  
  const handleDirectAccess = () => {
    navigate('/view-student-dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <Header />
      
      {/* Add this button somewhere visible near the top, after the header */}
      <div className="container mx-auto mt-4 px-4 text-center">
        <button
          onClick={handleDirectAccess}
          className="px-6 py-3 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-colors"
        >
          View Student Dashboard Demo
        </button>
      </div>
      
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
