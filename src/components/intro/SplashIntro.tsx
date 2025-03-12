import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export const SplashIntro = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  // This component is no longer used in the Index page
  // but we'll keep it for backward compatibility
  return (
    <motion.div 
      className="h-screen w-full relative bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black z-0"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 z-10"></div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">
              BLOCKWARD
            </h1>
            <p className="text-xl md:text-3xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The future of educational achievements on the blockchain
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-12"
          >
            <button 
              onClick={handleScrollDown}
              className="border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-full p-4 transition-all duration-300"
            >
              <ArrowDown className="h-6 w-6 animate-bounce" />
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* NFT Showcase animation */}
      <div className="absolute inset-x-0 bottom-0 h-32 flex justify-center items-end">
        <div className="flex space-x-4 pb-8 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-16 w-16 md:h-24 md:w-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg"
              initial={{ y: 100, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                rotate: [-5, 5, -5],
                transition: {
                  y: { delay: 0.5 + (i * 0.1), duration: 0.8 },
                  opacity: { delay: 0.5 + (i * 0.1), duration: 0.8 },
                  rotate: {
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }
                }
              }}
            >
              <img 
                src={`https://images.unsplash.com/photo-${1550000000000 + (i * 10000)}?w=500&auto=format&fit=crop`} 
                alt="NFT Preview"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop';
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
