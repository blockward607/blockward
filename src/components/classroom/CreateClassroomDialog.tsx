
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database } from "@/integrations/supabase/types";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface CreateClassroomDialogProps {
  onClassroomCreated: (newClassroom: Classroom) => void;
  onOpenChange: (open: boolean) => void;
}

export const CreateClassroomDialog = ({ onClassroomCreated, onOpenChange }: CreateClassroomDialogProps) => {
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createNewClass = async () => {
    if (!newClassroom.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a classroom name"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a classroom"
        });
        return;
      }

      // Get teacher profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !teacherProfile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Teacher profile not found"
        });
        return;
      }

      // Create the classroom
      const { data: newClassroomData, error } = await supabase
        .from('classrooms')
        .insert([
          {
            name: newClassroom.name.trim(),
            description: newClassroom.description.trim() || null,
            teacher_id: teacherProfile.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setNewClassroom({ name: "", description: "" });
      
      // Call the callback to update the parent component
      onClassroomCreated(newClassroomData);
      
      // Close dialog
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Classroom created successfully"
      });
    } catch (error: any) {
      console.error('Error creating classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create classroom"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">Create New Classroom</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Classroom name *"
            value={newClassroom.name}
            onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
            className="bg-black/50 border-purple-500/30 text-white"
            disabled={loading}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newClassroom.description}
            onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
            className="bg-black/50 border-purple-500/30 text-white min-h-[100px]"
            disabled={loading}
          />
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={createNewClass} 
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={loading || !newClassroom.name.trim()}
          >
            {loading ? "Creating..." : "Create Classroom"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
