import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Star, Rocket } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { DiamondLogo } from '../logo/DiamondLogo';
import './intro-animation.css';

interface BlockwardIntroProps {
  onEnter?: () => void;
}

export const BlockwardIntro = ({ onEnter }: BlockwardIntroProps) => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
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

  // Auto-advance slides
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < 3) {
        setCurrentSlide(currentSlide + 1);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);
  
  const enterSite = () => {
    // Animate out
    setShowIntro(false);
    
    // If onEnter prop exists, call it
    if (onEnter) {
      onEnter();
    } else {
      // Otherwise use the default behavior
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    }
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
  
  const slides = [
    {
      title: "WELCOME TO BLOCKWARD",
      subtitle: "EDUCATIONAL ACHIEVEMENTS REIMAGINED",
      description: "Where knowledge meets blockchain technology."
    },
    {
      title: "SECURE ACHIEVEMENTS",
      subtitle: "FOREVER OWNED BY STUDENTS",
      description: "Digital rewards that truly belong to the earner."
    },
    {
      title: "EASY CLASSROOM MANAGEMENT",
      subtitle: "FOR MODERN EDUCATORS",
      description: "Track attendance, rewards, and progress effortlessly."
    },
    {
      title: "JOIN THE FUTURE",
      subtitle: "OF EDUCATION",
      description: "Get started with BlockWard today!"
    }
  ];
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: showIntro ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-purple-900/20 to-transparent"></div>
        
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
        
        {/* Animated laser lines */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100"
            stroke="url(#gradient1)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          <motion.path
            d="M0,200 Q250,150 500,200 T1000,200"
            stroke="url(#gradient2)"
            strokeWidth="1"
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
        
        {/* Pulse circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-purple-500/30"
              initial={{ width: 100, height: 100, opacity: 0.7 }}
              animate={{ 
                width: [100, 500], 
                height: [100, 500], 
                opacity: [0.7, 0],
                borderWidth: [1, 0.2], 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: i * 1, 
                ease: "easeOut" 
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content overlay - slides */}
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
            <DiamondLogo size={80} />
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-6 shimmer-text"
            >
              {slides[currentSlide].title}
            </motion.h1>
            
            <motion.div className="text-center max-w-2xl mb-12">
              <h2 className="text-xl md:text-3xl text-purple-300 font-bold mb-4">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slide indicators */}
        <div className="flex space-x-2 mb-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${
                idx === currentSlide ? 'bg-purple-500' : 'bg-gray-700'
              } transition-colors duration-300`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
        
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
              <span>Enter BlockWard</span> 
              <Rocket className="w-5 h-5" />
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
