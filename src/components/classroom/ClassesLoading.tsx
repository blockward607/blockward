
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const ClassesLoading = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 flex flex-col items-center gap-3"
      >
        <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
        <span className="text-xl font-medium">Loading your classes...</span>
        <div className="mt-2 w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" />
      </motion.div>
    </div>
  );
};
