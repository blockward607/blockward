
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Classroom } from "./types";

export const useStudentClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const { toast } = useToast();

  const fetchStudentClassrooms = async (userId: string) => {
    try {
      // Get student's profile
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (studentError) {
        console.error("Error fetching student profile:", studentError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load student profile"
        });
        return [];
      }

      if (studentData) {
        console.log("Found student record:", studentData.id);
        // Get enrolled classrooms
        const { data: enrolledClassrooms, error } = await supabase
          .from('classroom_students')
          .select(`
            classroom:classrooms(*)
          `)
          .eq('student_id', studentData.id);

        if (error) {
          console.error("Error fetching enrolled classrooms:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load enrolled classrooms"
          });
          return [];
        }

        console.log(`Fetched ${enrolledClassrooms?.length || 0} enrolled classrooms`);
        
        // Extract classroom data from the joined result
        if (enrolledClassrooms && enrolledClassrooms.length > 0) {
          const extractedClassrooms = enrolledClassrooms
            .map(ec => ec.classroom)
            .filter(classroom => classroom !== null) as Classroom[];
            
          console.log("Extracted classrooms:", extractedClassrooms);
          setClassrooms(extractedClassrooms);
          return extractedClassrooms;
        }
      }
      setClassrooms([]);
      return [];
    } catch (error) {
      console.error("Error fetching student classrooms:", error);
      throw error;
    }
  };

  return {
    classrooms,
    setClassrooms,
    fetchStudentClassrooms
  };
};
