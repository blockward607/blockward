
import React from 'react';
import { motion } from "framer-motion";
import { AccessDemoButtons } from './AccessDemoButtons';

interface DemoSectionProps {
  id?: string;
}

export const DemoSection = ({ id }: DemoSectionProps) => {
  return (
    <div className="container mx-auto mt-16 px-4" id={id}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card modern-shadow p-10 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-6 gradient-text">Experience Blockward</h2>
        <p className="text-gray-300 mb-8 text-lg">
          Try our platform without registration or sign up now to get started with a free trial!
        </p>
        
        <AccessDemoButtons />
        
        <p className="mt-6 text-sm text-gray-400">
          After exploring the demo, sign up to create your own account and unlock all features.
        </p>
      </motion.div>
    </div>
  );
};
