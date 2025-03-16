import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Award, Sparkles, Shield, Diamond, Crown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface LuxuryIntroProps {
  onEnter?: () => void;
}

export const LuxuryIntro = ({ onEnter }: LuxuryIntroProps) => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.3,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };
  
  const enterSite = () => {
    // Animate out
    setShowIntro(false);
    
    // If onEnter prop exists, call it
    if (onEnter) {
      onEnter();
    } else {
      // Otherwise use the default behavior
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
    }
  };

  // Gold gradient colors
  const goldColors = [
    'from-yellow-300 to-amber-500',
    'from-amber-200 to-yellow-400',
    'from-yellow-400 to-amber-600',
  ];
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: showIntro ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Luxury background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rich dark texture */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIi8+PC9nPjwvc3ZnPg==')]"></div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-purple-900/20"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-[10%] right-[15%] w-96 h-96 bg-purple-600/10 rounded-full filter blur-[100px] animate-float"></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-indigo-600/10 rounded-full filter blur-[80px]" style={{ animationDelay: "1s" }}></div>
        
        {/* Gold particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute hexagon bg-gradient-to-br ${goldColors[i % goldColors.length]}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${10 + Math.random() * 20}px`,
              height: `${10 + Math.random() * 20}px`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
            initial={{ 
              scale: 0, 
              rotate: 0,
            }}
            animate={{ 
              scale: [0, 1, 0.8, 1], 
              rotate: [0, 90, 180, 270],
              y: [0, -30, -10, -50, 0],
              x: [0, 20, -20, 10, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Animated golden lines */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100"
            stroke="url(#goldGradient1)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 3, delay: 0.5 }}
          />
          <motion.path
            d="M0,200 Q250,150 500,200 T1000,200"
            stroke="url(#goldGradient2)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 3, delay: 0.7 }}
          />
          <defs>
            <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#F0E68C" />
            </linearGradient>
            <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F0E68C" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Main content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center h-full px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-12"
        >
          <div className="relative">
            <Shield className="w-28 h-28 text-purple-500" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Crown className="w-14 h-14 text-amber-300" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-8xl md:text-9xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400"
          style={{ 
            textShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
            letterSpacing: "-0.05em"
          }}
        >
          BLOCKWARD
        </motion.h1>
        
        <motion.div
          variants={itemVariants}
          className="text-center max-w-3xl mb-12"
        >
          <h2 className="text-2xl md:text-4xl text-amber-200 font-bold mb-6 tracking-wide">
            EXCLUSIVE EDUCATIONAL PLATFORM
          </h2>
          <p className="text-gray-300 text-xl mb-8 leading-relaxed">
            Where prestigious learning meets cutting-edge blockchain technology. Experience unparalleled digital rewards that celebrate excellence.
          </p>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={enterSite}
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-bold text-xl py-8 px-12 rounded-full flex items-center gap-3 shadow-[0_10px_25px_-5px_rgba(251,191,36,0.5)] transition-all duration-300"
            >
              Enter Excellence <Diamond className="w-5 h-5 text-white" />
            </Button>
          </motion.div>
          
          <motion.p
            className="mt-8 text-amber-300/80 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            The premium educational experience worth $12 million
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
