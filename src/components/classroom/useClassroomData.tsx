
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClassroomData = (refreshTrigger: number) => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, [refreshTrigger]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      const role = roleData?.role || 'student';
      setUserRole(role);

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
    } finally {
      setLoading(false);
    }
  };

  return {
    classrooms,
    loading,
    userRole
  };
};
