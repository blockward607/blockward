
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const ClassesLoading = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 flex items-center gap-3"
      >
        <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        <span className="text-xl">Loading classes...</span>
      </motion.div>
    </div>
  );
};
