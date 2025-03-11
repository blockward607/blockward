import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { motion } from "framer-motion";
import { ArrowRight, Info, GraduationCap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  const handleDirectAccess = () => {
    navigate('/view-student-dashboard');
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced header with logo */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <h1 className="text-3xl blockward-logo">Blockward</h1>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">How It Works</a>
          <a href="#demo" className="text-gray-300 hover:text-purple-400 transition-colors">Demo</a>
        </nav>
      </header>
      
      {/* Easy Access Section with clear header */}
      <div className="container mx-auto mt-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card modern-shadow p-6 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 gradient-text">Easy Access Demo</h2>
          <p className="text-gray-300 mb-6">
            Experience Blockward without registration. Click below to view a demo of our student dashboard.
          </p>
          <button
            onClick={handleDirectAccess}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full text-white font-medium hover-scale hover:from-purple-700 hover:to-purple-900 flex items-center gap-2 mx-auto"
          >
            View Student Dashboard Demo <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
      
      {/* Introduction Section - NEW */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="container mx-auto mt-16 px-4"
      >
        <div className="glass-card modern-shadow p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-bold gradient-text">What is Blockward?</h2>
          </div>
          
          <p className="text-gray-300 mb-6">
            Blockward is an innovative educational platform that combines blockchain technology with classroom management. It empowers educators to create engaging learning environments while providing students with unique digital rewards for their achievements.
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">How Blockward Works:</h3>
            <ul className="intro-list text-gray-300">
              <li>Create virtual classrooms and invite your students</li>
              <li>Track attendance with secure blockchain verification</li>
              <li>Issue NFT rewards for academic achievements and positive behavior</li>
              <li>Monitor student progress through detailed analytics</li>
              <li>Share educational resources securely with your class</li>
              <li>Engage students with gamified learning experiences</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <motion.div 
              className="p-4 rounded-full bg-purple-900/30 animate-float"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <GraduationCap className="w-16 h-16 text-purple-400" />
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Keep the Hero and Features sections */}
      <Hero />
      <Features />
      
      {/* Simple footer */}
      <footer className="py-8 bg-black mt-16 border-t border-purple-900/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2023 Blockward. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a>
            <a href="#" className="text-purple-400 hover:text-purple-300">Privacy</a>
            <a href="#" className="text-purple-400 hover:text-purple-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
