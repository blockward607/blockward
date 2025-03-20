
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClassroomDetails = (classroomId: string) => {
  const [teacher, setTeacher] = useState<any>(null);
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      if (!classroomId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch classroom data
        const { data: classroomData, error: classroomError } = await supabase
          .from('classrooms')
          .select('*, teacher:teacher_profiles(*)')
          .eq('id', classroomId)
          .single();

        if (classroomError) throw classroomError;

        setClassroom({
          id: classroomData.id,
          name: classroomData.name,
          description: classroomData.description,
          created_at: classroomData.created_at
        });

        // Set teacher data
        if (classroomData.teacher) {
          setTeacher(classroomData.teacher);
        }
      } catch (error: any) {
        console.error("Error fetching classroom details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classroomId]);

  return { teacher, classroom, loading, error };
};
