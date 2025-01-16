import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(155,135,245,0.1),rgba(30,27,38,0.3))]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Welcome to Blockward
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The future of classroom management powered by blockchain technology
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};