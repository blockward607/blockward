import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const InteractiveCube = () => {
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cubeRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const rotateX = (clientY / innerHeight - 0.5) * 60;
      const rotateY = (clientX / innerWidth - 0.5) * 60;
      
      cubeRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="w-40 h-40 relative transform-style-3d"
      ref={cubeRef}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      <div className="absolute w-full h-full bg-purple-600/20 transform translate-z-20 backdrop-blur-sm" />
      <div className="absolute w-full h-full bg-purple-600/20 transform -translate-z-20 backdrop-blur-sm" />
      <div className="absolute w-full h-full bg-purple-600/20 transform rotate-y-90 translate-x-20 backdrop-blur-sm" />
      <div className="absolute w-full h-full bg-purple-600/20 transform rotate-y-90 -translate-x-20 backdrop-blur-sm" />
      <div className="absolute w-full h-full bg-purple-600/20 transform rotate-x-90 translate-y-20 backdrop-blur-sm" />
      <div className="absolute w-full h-full bg-purple-600/20 transform rotate-x-90 -translate-y-20 backdrop-blur-sm" />
    </motion.div>
  );
};