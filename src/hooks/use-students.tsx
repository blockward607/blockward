
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
        
        if (!session) {
          console.log('No session found');
          setStudents([]);
          setLoading(false);
          return;
        }

        // Check user role first
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        const isAdmin = userRoles?.some(r => r.role === 'admin');
        const isTeacher = userRoles?.some(r => r.role === 'teacher');

        let studentData: Student[] = [];

        if (isAdmin) {
          // Admin: Get admin profile to find school_id, then get all students for that school
          const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('school_id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (adminProfile?.school_id) {
            const { data, error } = await supabase
              .from('students')
              .select('*')
              .eq('school_id', adminProfile.school_id)
              .order('name');
              
            if (error) throw error;
            studentData = data || [];
          }
        } else if (isTeacher) {
          // Teacher: Get students from their classrooms
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
                
                const { data, error } = await supabase
                  .from('students')
                  .select('*')
                  .in('id', studentIds)
                  .order('name');
                  
                if (error) throw error;
                studentData = data || [];
              }
            }
          }
        }
        // For students, don't load other students

        console.log(`Found ${studentData.length} students`);
        setStudents(studentData);
        
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
