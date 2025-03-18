
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DemoSection = () => {
  const navigate = useNavigate();
  
  const handleLearnMore = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleTeacherDemo = () => {
    navigate('/view-teacher-dashboard');
  };

  const handleStudentDemo = () => {
    navigate('/view-student-dashboard');
  };

  return (
    <div className="container mx-auto mt-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card modern-shadow p-6 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-4 gradient-text">Experience Blockward</h2>
        <p className="text-gray-300 mb-6">
          Try our platform without registration or sign up now to get started!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
          <Button
            onClick={handleTeacherDemo}
            className="px-6 py-4 h-auto bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl text-white font-medium hover:scale-105 hover:from-indigo-700 hover:to-indigo-900 flex items-center justify-center gap-2 transition-all"
          >
            Teacher Demo <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleStudentDemo}
            className="px-6 py-4 h-auto bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl text-white font-medium hover:scale-105 hover:from-purple-700 hover:to-purple-900 flex items-center justify-center gap-2 transition-all"
          >
            Student Demo <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleSignUp}
            className="px-6 py-4 h-auto bg-gradient-to-r from-green-600 to-green-800 rounded-xl text-white font-medium hover:scale-105 hover:from-green-700 hover:to-green-900 flex items-center justify-center gap-2 transition-all"
          >
            Sign Up Now <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleLearnMore}
            className="px-6 py-4 h-auto border border-purple-400 text-purple-400 rounded-xl font-medium hover:bg-purple-400/10 hover:scale-105 flex items-center justify-center gap-2 transition-all"
          >
            Learn More <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
