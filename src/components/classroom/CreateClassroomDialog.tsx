
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Database } from "@/integrations/supabase/types";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface CreateClassroomDialogProps {
  onClassroomCreated: (newClassroom: Classroom) => void;
  onOpenChange?: (open: boolean) => void;
}

export const CreateClassroomDialog = ({ onClassroomCreated, onOpenChange }: CreateClassroomDialogProps) => {
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  const createNewClass = async () => {
    try {
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .single();

      if (!teacherProfile) {
        throw new Error('Teacher profile not found');
      }

      const { data: newClassroomData, error } = await supabase
        .from('classrooms')
        .insert([
          {
            name: newClassroom.name,
            description: newClassroom.description,
            teacher_id: teacherProfile.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNewClassroom({ name: "", description: "" });
      onClassroomCreated(newClassroomData);
      
      toast({
        title: "Success",
        description: "New classroom created successfully"
      });
      
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error creating classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new classroom"
      });
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">Create New Classroom</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Classroom name"
            value={newClassroom.name}
            onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
            className="bg-black/50 border-purple-500/30 text-white"
          />
          <Textarea
            placeholder="Description"
            value={newClassroom.description}
            onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
            className="bg-black/50 border-purple-500/30 text-white min-h-[100px]"
          />
        </div>
        <Button onClick={createNewClass} className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg">
          Create Classroom
        </Button>
      </DialogContent>
    </Dialog>
  );
};
