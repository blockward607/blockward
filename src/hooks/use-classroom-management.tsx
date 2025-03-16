
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "./classroom/use-user-role";
import { useTeacherClassrooms } from "./classroom/use-teacher-classrooms";
import { useStudentClassrooms } from "./classroom/use-student-classrooms";
import { Classroom } from "./classroom/types";

export const useClassroomManagement = () => {
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const { toast } = useToast();
  
  const { userRole, checkUserRole } = useUserRole();
  const { classrooms: teacherClassrooms, setClassrooms: setTeacherClassrooms, fetchTeacherClassrooms } = useTeacherClassrooms();
  const { classrooms: studentClassrooms, setClassrooms: setStudentClassrooms, fetchStudentClassrooms } = useStudentClassrooms();

  const classrooms = userRole === 'teacher' ? teacherClassrooms : studentClassrooms;

  useEffect(() => {
    console.log("useClassroomManagement hook initialized");
    checkUserRoleAndFetchData();
  }, []);

  const checkUserRoleAndFetchData = async () => {
    try {
      setLoading(true);
      const result = await checkUserRole();
      
      if (!result) {
        setLoading(false);
        return;
      }
      
      const { role, userId } = result;

      if (role === 'teacher') {
        console.log("Fetching teacher's classrooms");
        await fetchTeacherClassrooms(userId);
      } else if (role === 'student') {
        console.log("Fetching student's enrolled classrooms");
        await fetchStudentClassrooms(userId);
      }
    } catch (error: any) {
      console.error('Error in checkUserRoleAndFetchData:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomCreated = (newClassroom: Classroom) => {
    if (userRole === 'teacher') {
      setTeacherClassrooms([newClassroom, ...teacherClassrooms]);
    } else {
      setStudentClassrooms([newClassroom, ...studentClassrooms]);
    }
    setSelectedClassroom(newClassroom);
    toast({
      title: "Success",
      description: `Classroom "${newClassroom.name}" created successfully`
    });
  };

  const handleDeleteClassroom = (classroomId: string) => {
    // Filter out the deleted classroom from the appropriate list
    if (userRole === 'teacher') {
      setTeacherClassrooms(teacherClassrooms.filter(classroom => classroom.id !== classroomId));
    } else {
      setStudentClassrooms(studentClassrooms.filter(classroom => classroom.id !== classroomId));
    }
    
    // If the deleted classroom was selected, clear the selection
    if (selectedClassroom && selectedClassroom.id === classroomId) {
      setSelectedClassroom(null);
    }
    
    toast({
      title: "Success",
      description: "Classroom deleted successfully"
    });
  };

  return {
    classrooms,
    loading,
    userRole,
    selectedClassroom,
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom
  };
};
