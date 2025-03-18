
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { School, GraduationCap, ArrowRight, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TutorialStartDialogProps {
  userRole: "teacher" | "student" | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTutorial: () => void;
}

export const TutorialStartDialog = ({ 
  userRole, 
  isOpen, 
  onOpenChange,
  onStartTutorial
}: TutorialStartDialogProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSkipTutorial = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: session.user.id,
            tutorial_completed: true,
          });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving tutorial preference:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTutorial = () => {
    if (userRole) {
      navigate(`/tutorial/${userRole}`);
    } else {
      // If role is not determined yet, use the popup tutorial
      onStartTutorial();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-black border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text text-center flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Welcome to Blockward
              <Sparkles className="w-6 h-6 text-purple-400" />
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-center pt-2">
              {userRole === "teacher" ? 
                "Would you like to start the tutorial to learn how to use Blockward for managing your classroom?" : 
                "Would you like to start the tutorial to learn how to use Blockward as a student?"}
            </DialogDescription>
          </DialogHeader>
        </motion.div>
        
        <div className="flex justify-center py-6">
          <motion.div 
            className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-800/50 to-indigo-800/50 border border-purple-500/30 flex items-center justify-center animate-float"
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {userRole === "teacher" ? (
              <School className="w-12 h-12 text-purple-300" />
            ) : (
              <GraduationCap className="w-12 h-12 text-indigo-300" />
            )}
          </motion.div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-4">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={handleSkipTutorial}
              disabled={loading}
              className="w-full sm:w-auto border-purple-500/30 bg-black hover:bg-purple-900/20 transition-all duration-300"
            >
              <X className="mr-2 h-4 w-4" /> Skip Tutorial
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleStartTutorial}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all duration-300"
            >
              Start Tutorial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
