
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Award, Sparkles, Shield } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import './intro-animation.css';

export const BlockwardIntro = () => {
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
  
  const hexagonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        delay: 0.2 * i,
        duration: 0.8,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    })
  };
  
  const enterSite = () => {
    // Animate out
    setShowIntro(false);
    
    // Redirect after animation
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  // Generate random NFT-style hexagon backgrounds
  const hexColors = [
    'from-purple-600 to-pink-600',
    'from-blue-600 to-cyan-500',
    'from-green-500 to-emerald-400',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500',
  ];
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: showIntro ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Floating hexagons */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={hexagonVariants}
              initial="hidden"
              animate="visible"
              className={`absolute hexagon bg-gradient-to-br ${hexColors[i % hexColors.length]}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${40 + Math.random() * 60}px`,
                height: `${40 + Math.random() * 60}px`,
              }}
            />
          ))}
        </div>
        
        {/* Animated lines */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-20">
            <motion.path
              d="M0,100 Q250,50 500,100 T1000,100"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.path
              d="M0,200 Q250,150 500,200 T1000,200"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.7 }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#9b87f5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
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
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <Shield className="w-24 h-24 text-purple-500" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-7xl md:text-9xl font-black mb-6 shimmer-text"
        >
          BLOCKWARD
        </motion.h1>
        
        <motion.div
          variants={itemVariants}
          className="text-center max-w-2xl mb-12"
        >
          <h2 className="text-xl md:text-3xl text-purple-300 font-bold mb-4">
            EDUCATIONAL ACHIEVEMENTS REIMAGINED
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Where knowledge meets blockchain technology. Unique digital rewards that celebrate student excellence.
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
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xl py-8 px-12 rounded-full flex items-center gap-3 modern-shadow transition-all duration-300"
            >
              Enter Blockward <Sparkles className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.p
            className="mt-6 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            The future of educational achievement
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
