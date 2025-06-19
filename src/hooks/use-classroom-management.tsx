
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserRole = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return null;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role || 'student';
      console.log('useClassroomManagement - fetched role:', role);
      setUserRole(role);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'student';
    }
  }, [navigate]);

  const refreshClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const role = await fetchUserRole();
      
      if (role === 'teacher') {
        // Get teacher's classrooms
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (teacherProfile) {
          const { data: teacherClassrooms } = await supabase
            .from('classrooms')
            .select(`
              *,
              classroom_students(count)
            `)
            .eq('teacher_id', teacherProfile.id);

          setClassrooms(teacherClassrooms || []);
        }
      } else {
        // Get student's enrolled classrooms
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (student) {
          const { data: enrollments } = await supabase
            .from('classroom_students')
            .select(`
              classroom_id,
              classrooms(*)
            `)
            .eq('student_id', student.id);

          const studentClassrooms = enrollments?.map(e => e.classrooms).filter(Boolean) || [];
          setClassrooms(studentClassrooms);
        }
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast, fetchUserRole]);

  const handleClassroomCreated = useCallback((newClassroom: any) => {
    console.log('New classroom created:', newClassroom);
    setClassrooms(prev => [...prev, newClassroom]);
    toast({
      title: "Success",
      description: "Classroom created successfully!"
    });
  }, [toast]);

  const handleDeleteClassroom = useCallback(async (classroomId: string) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', classroomId);

      if (error) throw error;

      setClassrooms(prev => prev.filter(c => c.id !== classroomId));
      toast({
        title: "Success",
        description: "Classroom deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom"
      });
    }
  }, [toast]);

  useEffect(() => {
    refreshClassrooms();
  }, [refreshClassrooms]);

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
