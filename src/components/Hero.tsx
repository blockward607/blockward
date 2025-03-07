
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { DemoSection } from "./demo/DemoSection";

export const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(155,135,245,0.1),rgba(30,27,38,0.3))] animate-pulse" />
      
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-purple-500/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
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
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <GraduationCap className="w-20 h-20 text-purple-400" />
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to Blockward
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            The future of classroom management powered by blockchain technology
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Learn More <Sparkles className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Add the demo section below the hero content */}
      <DemoSection />
    </div>
  );
};
