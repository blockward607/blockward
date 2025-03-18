
import React from 'react';
import { motion } from "framer-motion";
import { AccessDemoButtons } from './AccessDemoButtons';
import { Monitor, Sparkles } from 'lucide-react';

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
        className="glass-card modern-shadow p-10 text-center max-w-5xl mx-auto"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold mb-6 gradient-text flex items-center justify-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-purple-400" />
          Experience Blockward
          <Sparkles className="w-6 h-6 text-purple-400" />
        </motion.h2>
        
        <p className="text-gray-300 mb-12 text-lg">
          Try our platform without registration or sign up now to get started with a free trial!
        </p>
        
        {/* Preview Screenshots */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-center"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-xl shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4 z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center text-xs text-gray-400">Blockward - Student Dashboard</div>
            </div>
            <div className="pt-8 bg-gray-900 rounded-t-xl">
              <div className="overflow-hidden bg-gray-950 shadow-inner">
                <img 
                  src="/lovable-uploads/d4c06354-8d12-4434-b918-657c21b7f4c8.png" 
                  alt="Student Dashboard Preview" 
                  className="w-full object-cover border border-purple-900/30 transform hover:scale-[1.02] transition-transform"
                />
              </div>
            </div>
            <div className="py-2 px-4 bg-gray-900 text-center text-white text-sm rounded-b-xl border-t border-gray-800">
              <div className="flex items-center justify-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                Student Experience
              </div>
            </div>
          </div>
          
          <div className="relative w-full max-w-md overflow-hidden rounded-xl shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4 z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center text-xs text-gray-400">Blockward - Teacher Dashboard</div>
            </div>
            <div className="pt-8 bg-gray-900 rounded-t-xl">
              <div className="overflow-hidden bg-gray-950 shadow-inner">
                <img 
                  src="/lovable-uploads/7ec67536-e04a-4363-90ac-c6a0d76c4811.png" 
                  alt="Teacher Dashboard Preview" 
                  className="w-full object-cover border border-purple-900/30 transform hover:scale-[1.02] transition-transform"
                />
              </div>
            </div>
            <div className="py-2 px-4 bg-gray-900 text-center text-white text-sm rounded-b-xl border-t border-gray-800">
              <div className="flex items-center justify-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" />
                Teacher Experience
              </div>
            </div>
          </div>
        </motion.div>
        
        <AccessDemoButtons />
        
        <p className="mt-6 text-sm text-gray-400">
          After exploring the demo, sign up to create your own account and unlock all features.
        </p>
      </motion.div>
    </div>
  );
};
