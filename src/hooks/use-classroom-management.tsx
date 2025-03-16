
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

export const useClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRoleAndFetchData();
  }, []);

  const checkUserRoleAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to view classes"
        });
        return;
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(roleData?.role || null);

      if (roleData?.role === 'teacher') {
        // Fetch teacher's classrooms
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (teacherProfile) {
          const { data: classroomsData, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setClassrooms(classroomsData || []);
        }
      } else {
        // Fetch student's enrolled classrooms
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (studentData) {
          const { data: enrolledClassrooms, error } = await supabase
            .from('classroom_students')
            .select('classroom:classrooms(*)')
            .eq('student_id', studentData.id);

          if (error) throw error;
          setClassrooms(enrolledClassrooms?.map(ec => ec.classroom) || []);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomCreated = (newClassroom: Classroom) => {
    setClassrooms([newClassroom, ...classrooms]);
    setSelectedClassroom(newClassroom);
  };

  const handleDeleteClassroom = (classroomId: string) => {
    // Filter out the deleted classroom
    setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
    
    // If the deleted classroom was selected, clear the selection
    if (selectedClassroom && selectedClassroom.id === classroomId) {
      setSelectedClassroom(null);
    }
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
