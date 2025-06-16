
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/hooks/use-student-management";

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadStudents() {
      try {
        console.log('🔍 Starting loadStudents...');
        setLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ No session found');
          setStudents([]);
          setLoading(false);
          return;
        }

        console.log('✅ User session found:', { 
          userId: session.user.id, 
          email: session.user.email,
          metadata: session.user.user_metadata 
        });

        // Check user role first
        const { data: userRoles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roleError) {
          console.error('❌ Error fetching user roles:', roleError);
          setError(`Failed to fetch user roles: ${roleError.message}`);
          setLoading(false);
          return;
        }

        console.log('📋 User roles found:', userRoles);

        const isAdmin = userRoles?.some(r => r.role === 'admin');
        const isTeacher = userRoles?.some(r => r.role === 'teacher');
        const isStudent = userRoles?.some(r => r.role === 'student');

        console.log('🔑 Role check:', { isAdmin, isTeacher, isStudent });

        let studentData: Student[] = [];

        if (isAdmin) {
          console.log('👑 Loading data for admin user');
          // Admin: Get admin profile to find school_id, then get all students for that school
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_profiles')
            .select('school_id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error('❌ Error fetching admin profile:', adminError);
            setError(`Failed to fetch admin profile: ${adminError.message}`);
            setLoading(false);
            return;
          }

          console.log('📋 Admin profile:', adminProfile);

          if (adminProfile?.school_id) {
            console.log('🏫 Fetching students for school:', adminProfile.school_id);
            const { data, error } = await supabase
              .from('students')
              .select('*')
              .eq('school_id', adminProfile.school_id)
              .order('name');
              
            if (error) {
              console.error('❌ Error fetching students for admin:', error);
              setError(`Failed to fetch students: ${error.message}`);
              setLoading(false);
              return;
            }
            studentData = data || [];
            console.log(`✅ Admin loaded ${studentData.length} students:`, studentData);
          } else {
            console.log('⚠️ Admin has no school_id, showing empty list');
            studentData = [];
          }
        } else if (isTeacher) {
          console.log('👨‍🏫 Loading data for teacher user');
          // Teacher: Get students from their classrooms
          const { data: teacherProfile, error: teacherError } = await supabase
            .from('teacher_profiles')
            .select('id, school_id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (teacherError) {
            console.error('❌ Error fetching teacher profile:', teacherError);
            setError(`Failed to fetch teacher profile: ${teacherError.message}`);
            setLoading(false);
            return;
          }

          console.log('📋 Teacher profile:', teacherProfile);
            
          if (teacherProfile) {
            // Get classrooms for this teacher
            const { data: classrooms, error: classroomError } = await supabase
              .from('classrooms')
              .select('id')
              .eq('teacher_id', teacherProfile.id);
              
            if (classroomError) {
              console.error('❌ Error fetching teacher classrooms:', classroomError);
              setError(`Failed to fetch teacher classrooms: ${classroomError.message}`);
              setLoading(false);
              return;
            }

            console.log('🏫 Teacher classrooms:', classrooms);
              
            if (classrooms && classrooms.length > 0) {
              // Get students from all teacher's classrooms
              const classroomIds = classrooms.map(c => c.id);
              
              const { data: classroomStudents, error: csError } = await supabase
                .from('classroom_students')
                .select('student_id')
                .in('classroom_id', classroomIds);
                
              if (csError) {
                console.error('❌ Error fetching classroom students:', csError);
                setError(`Failed to fetch classroom students: ${csError.message}`);
                setLoading(false);
                return;
              }

              console.log('👥 Classroom students mappings:', classroomStudents);
                
              if (classroomStudents && classroomStudents.length > 0) {
                const studentIds = classroomStudents.map(cs => cs.student_id);
                
                const { data, error } = await supabase
                  .from('students')
                  .select('*')
                  .in('id', studentIds)
                  .order('name');
                  
                if (error) {
                  console.error('❌ Error fetching students for teacher:', error);
                  setError(`Failed to fetch students: ${error.message}`);
                  setLoading(false);
                  return;
                }
                studentData = data || [];
                console.log(`✅ Teacher loaded ${studentData.length} students:`, studentData);
              } else {
                console.log('⚠️ Teacher has no students in classrooms');
                studentData = [];
              }
            } else {
              console.log('⚠️ Teacher has no classrooms');
              studentData = [];
            }
          } else {
            console.log('❌ No teacher profile found');
            setError('Teacher profile not found');
            studentData = [];
          }
        } else if (isStudent) {
          // Students don't see other students
          console.log('👨‍🎓 User is a student, not loading other students');
          studentData = [];
        } else {
          console.log('❌ User has no recognized role');
          setError('User role not recognized');
          studentData = [];
        }

        console.log(`🎯 Final result: ${studentData.length} students for role: ${userRoles?.map(r => r.role).join(', ')}`);
        setStudents(studentData);
        
      } catch (error) {
        console.error("💥 Unexpected error loading students:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Unexpected error: ${errorMessage}`);
        setStudents([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load students: ${errorMessage}`
        });
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    }

    loadStudents();
  }, [toast]);

  return { students, loading, error };
};
