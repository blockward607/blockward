
import React from 'react';
import { motion } from 'framer-motion';
import { Diamond } from 'lucide-react';

interface DiamondLogoProps {
  size?: number;
  className?: string;
}

export const DiamondLogo: React.FC<DiamondLogoProps> = ({ 
  size = 40, 
  className = ""
}) => {
  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 blur-lg bg-purple-500/50 rounded-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5] 
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <Diamond 
          size={size} 
          className="text-purple-400 fill-purple-900" 
        />
      </motion.div>
    </motion.div>
  );
};
