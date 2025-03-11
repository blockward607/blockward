
import React from 'react';
import { motion } from "framer-motion";
import { Info, GraduationCap } from "lucide-react";

export const AboutSection = () => {
  return (
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
  );
};
