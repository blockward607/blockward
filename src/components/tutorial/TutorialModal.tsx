
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
}

interface TutorialModalProps {
  userRole: "teacher" | "student" | null;
  onClose: () => void;
}

export const TutorialModal = ({ userRole, onClose }: TutorialModalProps) => {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const teacherSteps: TutorialStep[] = [
    {
      title: "Welcome to Blockward",
      description: "This tutorial will guide you through the basic features of Blockward for teachers. You can always revisit this tutorial from the settings page."
    },
    {
      title: "Add Students",
      description: "You can add students manually, send email invitations, or generate an invite code for your classroom."
    },
    {
      title: "Track Attendance",
      description: "Use the attendance feature to track student attendance for each class session."
    },
    {
      title: "Award NFTs",
      description: "Reward your students with unique digital NFT achievements for their accomplishments."
    },
    {
      title: "Analyze Progress",
      description: "View detailed analytics about student performance and engagement."
    }
  ];

  const studentSteps: TutorialStep[] = [
    {
      title: "Welcome to Blockward",
      description: "This tutorial will guide you through the basic features of Blockward for students. You can always revisit this tutorial from the settings page."
    },
    {
      title: "Join a Class",
      description: "Join your teacher's classroom using an invite code or direct link."
    },
    {
      title: "Track Your Progress",
      description: "View your attendance, achievements, and points from your dashboard."
    },
    {
      title: "Collect NFT Rewards",
      description: "Earn and collect unique NFT rewards for your achievements."
    },
    {
      title: "View Your Wallet",
      description: "Access your digital wallet to see all your earned NFTs and certificates."
    }
  ];

  const steps = userRole === "teacher" ? teacherSteps : studentSteps;

  const handleClose = async () => {
    setOpen(false);
    // Save user preference not to show tutorial again
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          tutorial_completed: true,
        });
    }
    onClose();
  };

  const handleSkip = async () => {
    setOpen(false);
    // Save user preference not to show tutorial again
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          tutorial_completed: true,
        });
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-black border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">
            {steps[currentStep].title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] mt-4">
          <DialogDescription className="text-center text-gray-300 text-lg">
            {steps[currentStep].description}
          </DialogDescription>
          
          {steps[currentStep].image && (
            <div className="mt-4 flex justify-center">
              <img 
                src={steps[currentStep].image} 
                alt={steps[currentStep].title} 
                className="max-w-full max-h-[200px] rounded-lg border border-purple-500/30"
              />
            </div>
          )}
        </ScrollArea>
        
        <div className="flex justify-center mt-4">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <DialogFooter className="flex justify-between mt-4">
          <div>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white hover:bg-purple-900/20"
            >
              <X className="mr-2 h-4 w-4" /> Skip Tutorial
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-purple-500/30 text-white hover:bg-purple-900/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {currentStep < steps.length - 1 ? (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                <>Complete <Check className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
