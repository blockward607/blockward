
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DemoBannerProps {
  onSignUp: () => void;
}

export const DemoBanner = ({ onSignUp }: DemoBannerProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 glass-card bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-center"
    >
      <h2 className="text-xl font-bold mb-3 gradient-text">You're viewing the Student Demo</h2>
      <p className="text-gray-300 mb-4">
        This is a preview of the Blockward student dashboard. Sign up to access all features and start earning rewards!
      </p>
      <Button
        onClick={onSignUp}
        className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
      >
        Sign Up Now <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>
  );
};
