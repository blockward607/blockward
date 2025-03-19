
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Teacher {
  id: string;
  full_name: string;
}

interface Classroom {
  id: string;
  name: string;
  description: string;
}

export const useClassroomDetails = (classroomId: string) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      if (!classroomId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch classroom details
        const { data: classroomData, error: classroomError } = await supabase
          .from('classrooms')
          .select('id, name, description, teacher_id')
          .eq('id', classroomId)
          .single();
        
        if (classroomError) throw classroomError;
        
        setClassroom(classroomData);
        
        if (classroomData.teacher_id) {
          // Fetch teacher details
          const { data: teacherData, error: teacherError } = await supabase
            .from('teacher_profiles')
            .select('id, full_name, user_id')
            .eq('id', classroomData.teacher_id)
            .single();
            
          if (teacherError) throw teacherError;
          
          setTeacher(teacherData);
        }
      } catch (error) {
        console.error("Error fetching classroom details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassroomDetails();
  }, [classroomId]);

  return { teacher, classroom, loading };
};
