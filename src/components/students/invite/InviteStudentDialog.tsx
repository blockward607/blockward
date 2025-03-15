
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualEntryTab } from "./ManualEntryTab";
import { EmailInviteTab } from "./EmailInviteTab";
import { InviteCodeTab } from "./InviteCodeTab";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        <Button className="bg-purple-700 hover:bg-purple-800 flex items-center gap-2 text-lg py-6 px-4">
          <PlusCircle className="w-5 h-5" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">Add Student</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-navy-900/90">
            <TabsTrigger value="manual" className="data-[state=active]:bg-purple-700">Manual Entry</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-700">Email Invite</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-purple-700">Invite Code</TabsTrigger>
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
