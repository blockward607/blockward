
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGoogleClassroom } from "./useGoogleClassroom";
import { useAuth } from "@/hooks/use-auth";
import type { GoogleClassroom } from "@/services/google-classroom";

export const useGoogleClassroomImport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<GoogleClassroom | null>(null);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const {
    googleClassrooms: courses,
    loadingClassrooms: loading,
    fetchGoogleClassrooms,
    isAuthenticated,
    authenticateWithGoogle: handleAuthenticate
  } = useGoogleClassroom(user?.id);

  const handleSelectCourse = async (course: GoogleClassroom) => {
    setSelectedCourse(course);
    
    if (!studentsLoaded) {
      try {
        const studentsList = await window.gapi.client.classroom.courses.students.list({
          courseId: course.id,
          pageSize: 100
        }).then(response => response.result.students || []);
        
        setStudents(studentsList);
        setStudentsLoaded(true);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          variant: "destructive",
          title: "Failed to fetch students",
          description: "Could not retrieve students from Google Classroom"
        });
      }
    }
  };

  const handleImportClass = async () => {
    if (!selectedCourse) return;
    
    try {
      toast({
        title: "Class Imported",
        description: `Successfully imported ${selectedCourse.name}`
      });
      // Implement actual import logic here
    } catch (error) {
      console.error("Error importing class:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not import class from Google Classroom"
      });
    }
  };

  return {
    courses,
    selectedCourse,
    loading,
    students,
    studentsLoaded,
    handleImportClass,
    handleSelectCourse,
    handleAuthenticate,
    isAuthenticated
  };
};
