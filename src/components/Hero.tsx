
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Get Started button clicked - navigating to /auth');
    navigate('/auth');
  };
  
  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Learn More button clicked - scrolling to about section');
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn('About section not found, trying alternative selectors');
      // Try alternative ways to find the about section
      const howItWorks = document.querySelector('[id*="about"], [class*="about"], [data-section="about"]');
      if (howItWorks) {
        howItWorks.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden py-16 bg-black">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(155,135,245,0.1),rgba(30,27,38,0.3))] animate-pulse" />
      
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-purple-500/20 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <GraduationCap className="w-20 h-20 text-purple-400" />
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 blockward-logo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Your Classroom
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Engage students, track attendance, and reward achievements with blockchain technology
          </motion.p>
          
          <motion.p 
            className="text-xl md:text-2xl text-purple-400 font-bold mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Simple, Intuitive, and Powerful!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button 
              type="button"
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-none modern-shadow transition-all duration-300 transform hover:scale-105 flex items-center gap-2 cursor-pointer relative z-20"
              onClick={handleGetStarted}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              type="button"
              size="lg" 
              variant="ghost"
              className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer relative z-20"
              onClick={handleLearnMore}
            >
              How It Works <BookOpen className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
