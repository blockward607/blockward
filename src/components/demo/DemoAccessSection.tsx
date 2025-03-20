
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const DemoAccessSection = () => {
  const navigate = useNavigate();
  
  const handleStudentDemo = () => {
    console.log("Navigating to student demo dashboard");
    navigate('/view-student-dashboard');
  };

  const handleTeacherDemo = () => {
    console.log("Navigating to teacher demo dashboard");
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
        <h2 className="text-2xl font-bold mb-4 gradient-text">Easy Access Demo</h2>
        <p className="text-gray-300 mb-6">
          Experience Blockward without registration. Click below to explore our platform from either a student or teacher perspective.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStudentDemo}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full text-white font-medium hover-scale hover:from-purple-700 hover:to-purple-900 flex items-center gap-2"
          >
            View Student Demo <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleTeacherDemo}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-full text-white font-medium hover-scale hover:from-indigo-700 hover:to-indigo-900 flex items-center gap-2"
          >
            View Teacher Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <p className="mt-4 text-sm text-gray-400">
          After exploring the demo, sign up to create your own account and unlock all features.
        </p>
      </motion.div>
    </div>
  );
};
