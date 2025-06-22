
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddStudentDialogProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
}

export const AddStudentDialog = ({ onAddStudent }: AddStudentDialogProps) => {
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a student name"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add students"
        });
        return;
      }

      // Get teacher profile to get school_id
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('school_id')
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

      const { error } = await supabase
        .from('students')
        .insert({
          name: newStudentName.trim(),
          school: newStudentSchool.trim() || '',
          school_id: teacherProfile.school_id,
          points: 0
        });

      if (error) throw error;

      await onAddStudent(newStudentName, newStudentSchool);
      setNewStudentName("");
      setNewStudentSchool("");
      setOpen(false);
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add student"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-lg py-6 px-4">
          <PlusCircle className="w-5 h-5" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">Add New Student</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Student name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="bg-black/50 border-purple-500/30 text-white"
          />
          <Input
            placeholder="School (optional)"
            value={newStudentSchool}
            onChange={(e) => setNewStudentSchool(e.target.value)}
            className="bg-black/50 border-purple-500/30 text-white"
          />
        </div>
        <Button onClick={handleAddStudent} className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg">
          Add Student
        </Button>
      </DialogContent>
    </Dialog>
  );
};
