
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomCreated?: () => void;
}

export const CreateClassroomDialog = ({ open, onOpenChange, onClassroomCreated }: CreateClassroomDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a classroom name"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a classroom"
        });
        return;
      }

      // Get teacher profile to get school_id
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id, school_id')
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

      const { data, error } = await supabase
        .from('classrooms')
        .insert([{
          name: name.trim(),
          description: description.trim() || null,
          teacher_id: teacherProfile.id,
          school_id: teacherProfile.school_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Classroom created successfully"
      });

      setName("");
      setDescription("");
      onOpenChange(false);
      onClassroomCreated?.();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Classroom</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new classroom to your school
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Classroom Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Optional description of the classroom"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creating..." : "Create Classroom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
