
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Monitor, Sparkles, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const AccessDemoButtons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const handleButtonClick = async (path: string, buttonName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🔥 ${buttonName} button clicked - navigating to: ${path}`);
    
    if (loadingButton) {
      console.log('Another button is loading, ignoring click');
      return;
    }

    try {
      setLoadingButton(buttonName);
      
      toast({
        title: `${buttonName} Loading`,
        description: `Opening ${buttonName.toLowerCase()}...`
      });
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log(`✅ Navigating to ${path}`);
      navigate(path);
      
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: `Failed to open ${buttonName}. Please try again.`
      });
    } finally {
      setTimeout(() => setLoadingButton(null), 500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-8"
    >
      {/* Student Preview Button */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-xl"
      >
        <Button
          type="button"
          onClick={(e) => handleButtonClick('/view-student-dashboard', 'Student Preview', e)}
          disabled={loadingButton !== null}
          className="w-full py-8 h-auto bg-gradient-to-r from-indigo-600/90 to-purple-700/90 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_10px_25px_-5px_rgba(155,135,245,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(155,135,245,0.8)] transition-all duration-300 rounded-xl border border-purple-500/30 backdrop-blur-sm cursor-pointer relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="flex flex-col items-center justify-center gap-2 font-medium text-lg relative z-10">
            <Monitor className="w-8 h-8 mb-1 text-purple-300" />
            <span className="text-xl font-bold">
              {loadingButton === 'Student Preview' ? 'Loading...' : 'Student Preview'}
            </span>
            <span className="text-sm text-purple-200 font-normal">View student interface</span>
          </div>
        </Button>
      </motion.div>
      
      {/* Teacher Preview Button */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-xl"
      >
        <Button
          type="button"
          onClick={(e) => handleButtonClick('/view-teacher-dashboard', 'Teacher Preview', e)}
          disabled={loadingButton !== null}
          className="w-full py-8 h-auto bg-gradient-to-r from-blue-600/90 to-indigo-700/90 hover:from-blue-600 hover:to-indigo-700 text-white shadow-[0_10px_25px_-5px_rgba(129,140,248,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(129,140,248,0.8)] transition-all duration-300 rounded-xl border border-indigo-500/30 backdrop-blur-sm cursor-pointer relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="flex flex-col items-center justify-center gap-2 font-medium text-lg relative z-10">
            <Monitor className="w-8 h-8 mb-1 text-blue-300" />
            <span className="text-xl font-bold">
              {loadingButton === 'Teacher Preview' ? 'Loading...' : 'Teacher Preview'}
            </span>
            <span className="text-sm text-blue-200 font-normal">View teacher interface</span>
          </div>
        </Button>
      </motion.div>
      
      {/* Start Free Trial Button */}
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-xl"
      >
        <Button
          type="button"
          onClick={(e) => handleButtonClick('/auth', 'Start Free Trial', e)}
          disabled={loadingButton !== null}
          className="w-full py-8 h-auto bg-gradient-to-r from-green-600/90 to-emerald-700/90 hover:from-green-600 hover:to-emerald-700 text-white shadow-[0_10px_25px_-5px_rgba(52,211,153,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(52,211,153,0.8)] transition-all duration-300 rounded-xl border border-emerald-500/30 backdrop-blur-sm cursor-pointer relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <div className="flex flex-col items-center justify-center gap-2 font-medium text-lg relative z-10">
            <Sparkles className="w-8 h-8 mb-1 text-green-300" />
            <span className="text-xl font-bold">
              {loadingButton === 'Start Free Trial' ? 'Loading...' : 'Start Free Trial'}
            </span>
            <span className="text-sm text-green-200 font-normal">No credit card required</span>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
};
