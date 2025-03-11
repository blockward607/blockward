
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { motion } from "framer-motion";
import { ArrowRight, Info, GraduationCap, BookOpen, Home, User, Phone, Mail } from "lucide-react";
import { InteractiveLogo } from "@/components/logo/InteractiveLogo";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  const handleDirectAccess = () => {
    navigate('/view-student-dashboard');
  };

  const handleSignUp = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Enhanced header with interactive logo and navigation */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center border-b border-purple-900/20">
        <div className="flex items-center gap-3">
          <InteractiveLogo size={40} />
          <h1 className="text-3xl blockward-logo">Blockward</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </a>
          <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>About</span>
          </a>
          <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Features</span>
          </a>
          <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Contact</span>
          </a>
          <Button 
            onClick={handleSignUp}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          >
            Sign Up
          </Button>
        </nav>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-gray-300 hover:text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      
      {/* Introduction Section with clear explanation */}
      <motion.section 
        id="about"
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
      
      {/* Easy Access Section with clear header */}
      <div className="container mx-auto mt-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card modern-shadow p-6 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 gradient-text">Easy Access Demo</h2>
          <p className="text-gray-300 mb-6">
            Experience Blockward without registration. Click below to view a demo of our student dashboard to see how our platform transforms classroom management.
          </p>
          <button
            onClick={handleDirectAccess}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full text-white font-medium hover-scale hover:from-purple-700 hover:to-purple-900 flex items-center gap-2 mx-auto"
          >
            View Student Dashboard Demo <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
      
      {/* Hero section with value proposition and CTA */}
      <Hero />
      
      {/* Features section */}
      <Features />
      
      {/* Contact Section - NEW */}
      <section className="container mx-auto py-16 px-4">
        <div className="glass-card modern-shadow p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center blockward-logo">Get In Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold gradient-text">Contact Information</h3>
              <p className="text-gray-300">
                We'd love to hear from you! Reach out to us with questions about Blockward and how it can transform your classroom.
              </p>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <p className="text-gray-300">contact@blockward.edu</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <p className="text-gray-300">(123) 456-7890</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <Button
                onClick={handleSignUp}
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 w-full py-6 text-lg hover-scale"
              >
                Sign Up Now
              </Button>
              
              <p className="text-gray-400 mt-4 text-center text-sm">
                Join the future of educational technology
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer with links */}
      <footer className="py-8 bg-black mt-8 border-t border-purple-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <InteractiveLogo size={30} />
              <h3 className="text-xl blockward-logo">Blockward</h3>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 5.16c-.94.42-1.95.7-3 .82 1.08-.65 1.9-1.68 2.3-2.9-1.01.6-2.13 1.03-3.32 1.27-2.02-2.15-5.38-2.26-7.51-.25-.97.91-1.5 2.18-1.5 3.5 0 .63.07 1.24.21 1.82-5.97-.3-11.25-3.16-14.77-7.5-.62 1.06-.94 2.28-.94 3.52 0 2.4 1.22 4.53 3.07 5.77-.35-.01-1.11-.16-2.02-.47v.05c0 3.36 2.38 6.16 5.54 6.8-.58.16-1.19.24-1.8.24-.44 0-.87-.04-1.3-.13.88 2.76 3.43 4.76 6.45 4.82-2.36 1.85-5.34 2.95-8.57 2.95-.56 0-1.11-.03-1.65-.1 3.05 1.96 6.69 3.1 10.6 3.1 12.72 0 19.67-10.54 19.67-19.67v-.9c1.35-.97 2.52-2.18 3.45-3.55z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.38 0 0 5.38 0 12c0 5.3 3.44 9.8 8.2 11.37.6.11.82-.26.82-.58l-.01-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.73.08-.73 1.19.08 1.82 1.23 1.82 1.23 1.06 1.83 2.8 1.3 3.47.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.9 1.23 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.62-5.38-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 11.5c0 6.35-5.15 11.5-11.5 11.5S1 17.85 1 11.5 6.15 0 12.5 0 24 5.15 24 11.5zm-11.5 8.5c4.7 0 8.5-3.8 8.5-8.5S17.2 3 12.5 3 4 6.8 4 11.5s3.8 8.5 8.5 8.5zm.5-10.5v-4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zm0 4v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-purple-900/30">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 Blockward. All rights reserved.</p>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
