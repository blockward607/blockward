
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
          // Get teacher profile with timeout handling
          const { data: teacherProfile, error: teacherError } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (teacherError) {
            console.error('Error getting teacher profile:', teacherError);
            setStudents([]);
            setLoading(false);
            return;
          }
            
          if (teacherProfile) {
            // Get classrooms for this teacher
            const { data: classrooms, error: classroomsError } = await supabase
              .from('classrooms')
              .select('id')
              .eq('teacher_id', teacherProfile.id);
              
            if (classroomsError) {
              console.error('Error getting classrooms:', classroomsError);
              setStudents([]);
              setLoading(false);
              return;
            }
              
            if (classrooms && classrooms.length > 0) {
              // Get students from all teacher's classrooms
              const classroomIds = classrooms.map(c => c.id);
              
              const { data: classroomStudents, error: enrollmentError } = await supabase
                .from('classroom_students')
                .select('student_id')
                .in('classroom_id', classroomIds);
                
              if (enrollmentError) {
                console.error('Error getting enrollments:', enrollmentError);
                setStudents([]);
                setLoading(false);
                return;
              }
                
              if (classroomStudents && classroomStudents.length > 0) {
                const studentIds = classroomStudents.map(cs => cs.student_id);
                
                const { data: studentData, error: studentsError } = await supabase
                  .from('students')
                  .select('*')
                  .in('id', studentIds)
                  .order('name');
                  
                if (studentsError) {
                  console.error('Error from Supabase:', studentsError);
                  setStudents([]);
                  setLoading(false);
                  return;
                }
                
                if (studentData && studentData.length > 0) {
                  console.log(`Found ${studentData.length} students in teacher's classrooms`);
                  setStudents(studentData);
                } else {
                  setStudents([]);
                }
              } else {
                setStudents([]);
              }
            } else {
              setStudents([]);
            }
          } else {
            setStudents([]);
          }
        } else {
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
