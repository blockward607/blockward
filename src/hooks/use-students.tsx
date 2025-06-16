
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/hooks/use-student-management";

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadStudents() {
      try {
        console.log('Loading students...');
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get teacher profile
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (teacherProfile) {
            // Get classrooms for this teacher
            const { data: classrooms } = await supabase
              .from('classrooms')
              .select('id')
              .eq('teacher_id', teacherProfile.id);
              
            if (classrooms && classrooms.length > 0) {
              // Get students from all teacher's classrooms
              const classroomIds = classrooms.map(c => c.id);
              
              const { data: classroomStudents } = await supabase
                .from('classroom_students')
                .select('student_id')
                .in('classroom_id', classroomIds);
                
              if (classroomStudents && classroomStudents.length > 0) {
                const studentIds = classroomStudents.map(cs => cs.student_id);
                
                const { data: studentData, error } = await supabase
                  .from('students')
                  .select('*')
                  .in('id', studentIds)
                  .order('name');
                  
                if (error) {
                  console.error('Error from Supabase:', error);
                  throw error;
                }
                
                if (studentData && studentData.length > 0) {
                  console.log(`Found ${studentData.length} students in teacher's classrooms`);
                  setStudents(studentData);
                } else {
                  // No students found, return empty array
                  setStudents([]);
                }
              } else {
                // No classroom students found, return empty array
                setStudents([]);
              }
            } else {
              // No classrooms found, return empty array
              setStudents([]);
            }
          } else {
            // No teacher profile found, return empty array
            setStudents([]);
          }
        } else {
          // No session found, return empty array
          setStudents([]);
        }
      } catch (error) {
        console.error("Error loading students:", error);
        setStudents([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students"
        });
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [toast]);

  return { students, loading };
};
