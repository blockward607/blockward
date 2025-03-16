
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TutorialStartDialogProps {
  userRole: "teacher" | "student" | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTutorial: () => void;
  onSkipTutorial: () => void;
}

export const TutorialStartDialog = ({ 
  userRole, 
  isOpen, 
  onOpenChange,
  onStartTutorial,
  onSkipTutorial
}: TutorialStartDialogProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSkipTutorial = async () => {
    setLoading(true);
    try {
      onSkipTutorial();
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
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text text-center">
            Welcome to Blockward
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center pt-2">
            {userRole === "teacher" ? 
              "Would you like to start the tutorial to learn how to use Blockward for managing your classroom?" : 
              "Would you like to start the tutorial to learn how to use Blockward as a student?"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-purple-800/30 flex items-center justify-center animate-float">
            {userRole === "teacher" ? (
              <span className="text-4xl">👨‍🏫</span>
            ) : (
              <span className="text-4xl">👨‍🎓</span>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-4">
          <Button
            variant="outline"
            onClick={handleSkipTutorial}
            disabled={loading}
            className="w-full sm:w-auto border-purple-500/30 bg-black hover:bg-purple-900/20"
          >
            Skip Tutorial
          </Button>
          
          <Button 
            onClick={handleStartTutorial}
            disabled={loading}
            className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800"
          >
            Start Tutorial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
