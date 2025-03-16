
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClassroomData = (classroomId: string) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    checkUserRole();
    fetchStudentCount();
  }, [classroomId]);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      setUserRole(roleData?.role || null);
    }
  };

  const fetchStudentCount = async () => {
    const { count } = await supabase
      .from('classroom_students')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroomId);
    
    setStudentCount(count || 0);
  };

  return {
    userRole,
    studentCount
  };
};
