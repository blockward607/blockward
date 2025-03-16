
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

  const handleTeacherDemo = () => {
    navigate('/view-teacher-dashboard');
  };

  const handleStudentDemo = () => {
    navigate('/view-student-dashboard');
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card modern-shadow p-8 text-center max-w-4xl mx-auto rounded-xl"
      >
        <h2 className="text-3xl font-bold mb-6 gradient-text">Try Blockward Today</h2>
        <p className="text-gray-300 mb-8 text-lg">
          Experience our platform with full access to all NFT and educational features!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          <Button
            onClick={handleTeacherDemo}
            className="px-6 py-6 h-auto bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl text-white font-medium text-lg hover:scale-105 hover:from-indigo-700 hover:to-indigo-900 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
          >
            Teacher Demo <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handleStudentDemo}
            className="px-6 py-6 h-auto bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl text-white font-medium text-lg hover:scale-105 hover:from-purple-700 hover:to-purple-900 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
          >
            Student Demo <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <Button
            onClick={handleLearnMore}
            className="px-8 py-3 h-auto border-2 border-purple-400 text-purple-400 rounded-xl font-bold text-lg hover:bg-purple-400/10 hover:scale-105 flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto"
          >
            Learn More <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
