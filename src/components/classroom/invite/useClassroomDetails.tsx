
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClassroomDetails = (classroomId: string) => {
  const [teacherName, setTeacherName] = useState<string>("");
  const [classroomName, setClassroomName] = useState<string>("");
  
  useEffect(() => {
    const fetchClassroomDetails = async () => {
      if (!classroomId) return;
      
      try {
        // Get classroom details
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('name, teacher_id')
          .eq('id', classroomId)
          .single();
          
        if (classroomError) throw classroomError;
        
        if (classroom) {
          setClassroomName(classroom.name || "");
          
          // Get teacher details
          if (classroom.teacher_id) {
            const { data: teacher, error: teacherError } = await supabase
              .from('teacher_profiles')
              .select('full_name')
              .eq('id', classroom.teacher_id)
              .single();
              
            if (teacherError && !teacherError.message.includes('No rows found')) {
              throw teacherError;
            }
            
            if (teacher?.full_name) {
              setTeacherName(teacher.full_name);
            } else {
              // Fallback to fetching from user table if no full_name in teacher_profile
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                setTeacherName(session.user.user_metadata?.name || "Teacher");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching classroom details:", error);
      }
    };
    
    fetchClassroomDetails();
  }, [classroomId]);
  
  return { teacherName, classroomName };
};
