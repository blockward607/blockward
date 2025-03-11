
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const DemoSection = () => {
  const navigate = useNavigate();
  
  const handleLearnMore = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudentDemo = () => {
    navigate('/view-student-dashboard');
  };

  const handleTeacherDemo = () => {
    navigate('/view-teacher-dashboard');
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
          Try our platform without registration. Choose a demo to explore Blockward from either perspective.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStudentDemo}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full text-white font-medium hover:scale-105 hover:from-purple-700 hover:to-purple-900 flex items-center justify-center gap-2 transition-all"
          >
            Student Demo <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleTeacherDemo}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-full text-white font-medium hover:scale-105 hover:from-indigo-700 hover:to-indigo-900 flex items-center justify-center gap-2 transition-all"
          >
            Teacher Demo <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleLearnMore}
            className="px-6 py-3 border border-purple-400 text-purple-400 rounded-full font-medium hover:bg-purple-400/10 hover:scale-105 flex items-center justify-center gap-2 transition-all"
          >
            Learn More <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
