
import { useState, useEffect, useCallback } from "react";
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

  const checkUserRoleAndFetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        setLoading(false);
        return;
      }

      // Get user role first
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        throw roleError;
      }

      const role = roleData?.role || null;
      setUserRole(role);
      console.log("User role:", role);

      // Now fetch classrooms based on role
      if (role === 'teacher') {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (teacherProfile) {
          const { data: classroomsData, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          console.log("Fetched classrooms:", classroomsData);
          setClassrooms(classroomsData || []);
        }
      } else if (role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (studentData) {
          const { data: enrolledClassrooms, error } = await supabase
            .from('classroom_students')
            .select('classroom:classrooms(*)')
            .eq('student_id', studentData.id);

          if (error) throw error;
          const validClassrooms = enrolledClassrooms
            ?.map(ec => ec.classroom)
            .filter((c): c is Classroom => c !== null) || [];
          setClassrooms(validClassrooms);
        }
      }
    } catch (error: any) {
      console.error('Error in checkUserRoleAndFetchData:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshClassrooms = useCallback(() => {
    checkUserRoleAndFetchData();
  }, [checkUserRoleAndFetchData]);

  useEffect(() => {
    checkUserRoleAndFetchData();
  }, [checkUserRoleAndFetchData]);

  const handleClassroomCreated = useCallback((newClassroom: Classroom) => {
    setClassrooms(prev => [newClassroom, ...prev]);
    setSelectedClassroom(newClassroom);
    toast({
      title: "Success",
      description: `Classroom "${newClassroom.name}" created successfully`
    });
  }, [toast]);

  const handleDeleteClassroom = useCallback((classroomId: string) => {
    setClassrooms(prev => prev.filter(classroom => classroom.id !== classroomId));
    setSelectedClassroom(prev => prev?.id === classroomId ? null : prev);
    toast({
      title: "Success",
      description: "Classroom deleted successfully"
    });
  }, [toast]);

  return {
    classrooms,
    loading,
    userRole,
    selectedClassroom,
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom,
    refreshClassrooms
  };
};
