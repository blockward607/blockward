
import { useState } from "react";
import { PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualEntryTab } from "./ManualEntryTab";
import { EmailInviteTab } from "./EmailInviteTab";
import { InviteCodeTab } from "./InviteCodeTab";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface InviteStudentDialogProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
}

export const InviteStudentDialog = ({ onAddStudent }: InviteStudentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCloseDialog = () => {
    setOpen(false);
  };

  // Custom onAddStudent handler to ensure proper error handling
  const handleAddStudent = async (name: string, school: string) => {
    try {
      await onAddStudent(name, school);
      handleCloseDialog();
    } catch (error) {
      console.error("Error in InviteStudentDialog:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student, please try again."
      });
      throw error; // Re-throw to let the tab component handle it
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-br from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-900 flex items-center gap-2 text-lg py-6 px-4 shadow-[0_5px_15px_rgba(147,51,234,0.4)]">
            <PlusCircle className="w-5 h-5" />
            <span>Add Student</span>
            <Sparkles className="w-3 h-3 ml-1 animate-pulse text-purple-300" />
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black border border-purple-500/40 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white glow-text">Add Student</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/90 border border-purple-500/30">
            <TabsTrigger value="manual" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">Manual Entry</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">Email Invite</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">Invite Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <ManualEntryTab 
              onAddStudent={handleAddStudent} 
              onSuccess={handleCloseDialog} 
            />
          </TabsContent>
          
          <TabsContent value="email">
            <EmailInviteTab onSuccess={handleCloseDialog} />
          </TabsContent>
          
          <TabsContent value="code">
            <InviteCodeTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
