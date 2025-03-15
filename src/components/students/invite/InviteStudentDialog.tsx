
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualEntryTab } from "./ManualEntryTab";
import { EmailInviteTab } from "./EmailInviteTab";
import { InviteCodeTab } from "./InviteCodeTab";

interface InviteStudentDialogProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
}

export const InviteStudentDialog = ({ onAddStudent }: InviteStudentDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-700 hover:bg-purple-800 flex items-center gap-2 text-lg py-6 px-4">
          <PlusCircle className="w-5 h-5" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1d2a] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">Add Student</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40">
            <TabsTrigger value="manual" className="data-[state=active]:bg-purple-700">Manual Entry</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-purple-700">Email Invite</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-purple-700">Invite Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <ManualEntryTab 
              onAddStudent={onAddStudent} 
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
