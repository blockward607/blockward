
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStudents } from "@/hooks/use-students";
import { SecurityService } from "@/services/SecurityService";

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
    const sanitizedName = SecurityService.sanitizeInput(name);
    const sanitizedSchool = SecurityService.sanitizeInput(school);

    if (!SecurityService.isValidText(sanitizedName, 100)) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Please enter a valid student name (max 100 characters)"
      });
      return;
    }

    if (school && !SecurityService.isValidText(sanitizedSchool, 200)) {
      toast({
        variant: "destructive",
        title: "Invalid school",
        description: "School name must be under 200 characters"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          { 
            name: sanitizedName,
            school: sanitizedSchool || undefined,
            points: 0
          }
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student added successfully"
      });
      
    } catch (error) {
      console.error('Error adding student:', error);
      SecurityService.logSecurityEvent('student_creation_error', { 
        error: error.message,
        name: sanitizedName
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
    }
  };

  const initiateDeleteStudent = (id: string) => {
    if (!SecurityService.isValidUUID(id)) {
      SecurityService.logSecurityEvent('invalid_student_delete_id', { id });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid student ID"
      });
      return;
    }

    setStudentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete || !SecurityService.isValidUUID(studentToDelete)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid student ID"
      });
      return;
    }
    
    try {
      // First delete any classroom_students associations
      const { error: relError } = await supabase
        .from('classroom_students')
        .delete()
        .eq('student_id', studentToDelete);

      if (relError) {
        console.error('Error deleting classroom associations:', relError);
        // Continue anyway as this might not be a critical error
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
      SecurityService.logSecurityEvent('student_deletion_error', { 
        error: error.message,
        studentId: studentToDelete
      });
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
