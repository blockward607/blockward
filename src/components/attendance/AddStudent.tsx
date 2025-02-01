import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddStudentProps {
  classroomId: string;
  onStudentAdded: () => void;
}

export const AddStudent = ({ classroomId, onStudentAdded }: AddStudentProps) => {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const { toast } = useToast();

  const addNewStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a student name"
      });
      return;
    }

    try {
      console.log('Creating new student:', newStudentName);
      
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert([{ 
          name: newStudentName.trim(),
          points: 0
        }])
        .select()
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        throw studentError;
      }

      console.log('Student created successfully:', newStudent);

      const { error: classroomError } = await supabase
        .from('classroom_students')
        .insert([{
          classroom_id: classroomId,
          student_id: newStudent.id,
        }]);

      if (classroomError) {
        console.error('Error adding student to classroom:', classroomError);
        throw classroomError;
      }

      toast({
        title: "Success",
        description: "Student added successfully"
      });

      setNewStudentName("");
      setShowAddStudent(false);
      onStudentAdded();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">Students</h2>
      {!showAddStudent ? (
        <Button 
          variant="outline" 
          onClick={() => setShowAddStudent(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter student name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="w-64"
          />
          <Button onClick={addNewStudent}>Add</Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setShowAddStudent(false);
              setNewStudentName("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};