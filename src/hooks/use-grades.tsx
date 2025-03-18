
import { useState, useEffect } from "react";
import { GradeService } from "@/services/GradeService";
import { useToast } from "@/hooks/use-toast";
import { Grade, Assignment, StudentGrade } from "@/services/class-join/types";

export const useGrades = (studentId?: string, classroomId?: string) => {
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const { toast } = useToast();

  // Fetch student grades
  const fetchStudentGrades = async () => {
    if (!studentId || !classroomId) return;
    
    setLoadingGrades(true);
    try {
      const grades = await GradeService.getStudentGrades(studentId, classroomId);
      setStudentGrades(grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load grades"
      });
    } finally {
      setLoadingGrades(false);
    }
  };

  // Fetch classroom assignments
  const fetchAssignments = async () => {
    if (!classroomId) return;
    
    setLoadingAssignments(true);
    try {
      const { data, error } = await GradeService.getClassroomAssignments(classroomId);
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignments"
      });
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Submit a grade
  const submitGrade = async (grade: Partial<Grade>) => {
    try {
      const { data, error } = await GradeService.submitGrade(grade);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Grade submitted successfully"
      });
      
      // Refresh grades
      if (studentId && classroomId) {
        fetchStudentGrades();
      }
      
      return data;
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit grade"
      });
      return null;
    }
  };

  // Create assignment
  const createAssignment = async (assignment: Partial<Assignment>) => {
    try {
      const { data, error } = await GradeService.createAssignment(assignment);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Assignment created successfully"
      });
      
      // Refresh assignments
      fetchAssignments();
      
      return data;
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create assignment"
      });
      return null;
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchAssignments();
    }
  }, [classroomId]);

  useEffect(() => {
    if (studentId && classroomId) {
      fetchStudentGrades();
    }
  }, [studentId, classroomId]);

  return {
    studentGrades,
    assignments,
    loadingGrades,
    loadingAssignments,
    fetchStudentGrades,
    fetchAssignments,
    submitGrade,
    createAssignment
  };
};
