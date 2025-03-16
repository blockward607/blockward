
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Classroom } from "./types";

export const useTeacherClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const { toast } = useToast();

  const fetchTeacherClassrooms = async (userId: string) => {
    try {
      // Fetch teacher's profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching teacher profile:", profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teacher profile"
        });
        return [];
      }

      if (teacherProfile) {
        const { data: classroomsData, error } = await supabase
          .from('classrooms')
          .select('*')
          .eq('teacher_id', teacherProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching classrooms:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classrooms"
          });
          return [];
        }

        console.log(`Fetched ${classroomsData?.length || 0} classrooms`);
        setClassrooms(classroomsData || []);
        return classroomsData || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching teacher classrooms:", error);
      throw error;
    }
  };

  return {
    classrooms,
    setClassrooms,
    fetchTeacherClassrooms
  };
};
