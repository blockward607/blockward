
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClassroomData = (classroomId: string) => {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchClassroomData();
  }, [classroomId]);

  const fetchClassroomData = async () => {
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

      // Get student count for classroom
      const { data: studentsData, count } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact' })
        .eq('classroom_id', classroomId);

      setStudentCount(count || 0);
    } catch (error) {
      console.error('Error fetching classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    studentCount,
    loading,
    userRole
  };
};
