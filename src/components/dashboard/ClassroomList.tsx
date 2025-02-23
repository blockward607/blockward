
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClassroomGrid } from "@/components/classroom/ClassroomGrid";
import type { Classroom } from "@/types/classroom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClassroomListProps {
  classrooms: Partial<Classroom>[];
}

export const ClassroomList = ({ classrooms }: ClassroomListProps) => {
  const [expanded, setExpanded] = useState(true);
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  const handleCreateClassroom = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to create a classroom"
        });
        return;
      }

      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Profile not found",
          description: "Teacher profile not found. Please contact support."
        });
        return;
      }

      const { data, error } = await supabase
        .from('classrooms')
        .insert([{
          name: newClassroom.name,
          description: newClassroom.description,
          teacher_id: teacherProfile.id
        }])
        .select()
        .single();

      if (error) throw error;

      window.location.reload();

      setNewClassroom({ name: "", description: "" });
      toast({
        title: "Success",
        description: "Classroom created successfully"
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom"
      });
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <h2 className="text-2xl font-semibold gradient-text">My Classrooms</h2>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> New Classroom
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Classroom</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Classroom name"
                value={newClassroom.name}
                onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newClassroom.description}
                onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateClassroom} className="w-full bg-purple-600 hover:bg-purple-700">
              Create Classroom
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      {expanded && (
        <div className="grid gap-6">
          {classrooms.map((classroom) => (
            classroom.id && <ClassroomGrid key={classroom.id} classroom={classroom as Classroom} />
          ))}
          {classrooms.length === 0 && (
            <p className="text-center text-gray-400">No classrooms found. Create your first classroom to get started!</p>
          )}
        </div>
      )}
    </Card>
  );
};
