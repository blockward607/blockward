
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateClassroom = async () => {
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

      // Automatically generate a classroom code for the new classroom
      console.log("[ClassroomList] Generating classroom code for new classroom:", data.id);
      
      const { data: classroomCode, error: codeError } = await supabase.rpc('create_classroom_code', {
        p_classroom_id: data.id,
        p_created_by: session.user.id
      });

      if (codeError) {
        console.error("[ClassroomList] Error generating classroom code:", codeError);
        toast({
          title: "Classroom Created",
          description: "Classroom created successfully, but there was an issue generating the join code. You can generate one later."
        });
      } else {
        console.log("[ClassroomList] Classroom code generated successfully:", classroomCode);
        toast({
          title: "Success",
          description: `Classroom created successfully with join code: ${classroomCode}`
        });
      }

      window.location.reload();

      setNewClassroom({ name: "", description: "" });
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom"
      });
    } finally {
      setLoading(false);
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
                disabled={loading}
              />
              <Textarea
                placeholder="Description"
                value={newClassroom.description}
                onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleCreateClassroom} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading || !newClassroom.name.trim()}
            >
              {loading ? "Creating..." : "Create Classroom"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      {expanded && (
        <div className="grid gap-6">
          {classrooms.map((classroom) => {
            if (!classroom.id) return null;
            
            // Ensure we have all required fields with defaults
            const fullClassroom: Classroom = {
              id: classroom.id,
              name: classroom.name || '',
              description: classroom.description || '',
              teacher_id: classroom.teacher_id || '',
              school_id: classroom.school_id || null,
              section: classroom.section || null,
              created_at: classroom.created_at || '',
              updated_at: classroom.updated_at || ''
            };
            
            return <ClassroomGrid key={classroom.id} classroom={fullClassroom} />
          })}
          {classrooms.length === 0 && (
            <p className="text-center text-gray-400">No classrooms found. Create your first classroom to get started!</p>
          )}
        </div>
      )}
    </Card>
  );
};
