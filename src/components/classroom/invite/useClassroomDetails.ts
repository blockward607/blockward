
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useClassroomDetails = (classroomId: string) => {
  const [teacherName, setTeacherName] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('name, teacher_id')
          .eq('id', classroomId)
          .single();
          
        if (classroom) {
          setClassroomName(classroom.name);
          
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('full_name')
            .eq('id', classroom.teacher_id)
            .single();
            
          if (teacherProfile) {
            setTeacherName(teacherProfile.full_name || 'Your Teacher');
          }
        }
      } catch (error: any) {
        console.error('Error fetching classroom details:', error);
        setError(error.message || 'Failed to load classroom details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassroomDetails();
  }, [classroomId]);

  return {
    teacherName,
    classroomName,
    loading,
    error
  };
};
