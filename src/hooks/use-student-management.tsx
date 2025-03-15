
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStudents } from "@/hooks/use-students";

export interface Student {
  id: string;
  name: string;
  points: number;
  created_at: string;
  school?: string;
  user_id?: string;
}

export const useStudentManagement = () => {
  const { students, loading } = useStudents();
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const addNewStudent = async (name: string, school: string): Promise<void> => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a student name"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          { 
            name: name.trim(),
            school: school.trim() || undefined,
            points: 0
          }
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student added successfully"
      });
      
      // Return void instead of data
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
    }
  };

  const initiateDeleteStudent = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      // First delete any classroom_students associations
      const { error: relError } = await supabase
        .from('classroom_students')
        .delete()
        .eq('student_id', studentToDelete);

      if (relError) {
        console.error('Error deleting classroom associations:', relError);
        // Continue anyway
      }

      // Then delete the student
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentToDelete);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student"
      });
    } finally {
      setStudentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return {
    students,
    loading,
    studentToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    addNewStudent,
    initiateDeleteStudent,
    confirmDeleteStudent
  };
};
