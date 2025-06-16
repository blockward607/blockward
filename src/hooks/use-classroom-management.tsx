
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export const useClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"teacher" | "student" | "admin" | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<any | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshClassrooms = useCallback(async () => {
    try {
      console.log('🔍 Classroom Management: Starting refreshClassrooms...');
      setLoading(true);
      setError(null);

      if (!user) {
        console.log('❌ Classroom Management: No user found');
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('✅ Classroom Management: User found:', { userId: user.id, email: user.email });

      // Determine user role(s)
      const { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleError) {
        console.error('❌ Classroom Management: Error fetching user roles:', roleError);
        setError(`Failed to fetch user roles: ${roleError.message}`);
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      if (!userRoles || userRoles.length === 0) {
        console.log('⚠️ Classroom Management: No roles found for user');
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('📋 Classroom Management: User roles found:', userRoles);

      let determinedRole: "teacher" | "student" | "admin" | null = null;
      let foundClassrooms: any[] = [];

      if (userRoles?.some((r) => r.role === "admin")) {
        determinedRole = "admin";
        console.log('👑 Classroom Management: Loading classrooms for admin');
        
        // Admin: Get all classrooms for their school
        const { data: adminProfile, error: adminError } = await supabase
          .from("admin_profiles")
          .select("school_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminError) {
          console.error('❌ Classroom Management: Error fetching admin profile:', adminError);
          setError(`Failed to fetch admin profile: ${adminError.message}`);
        } else if (adminProfile?.school_id) {
          // Get all classrooms for the school (need to link through teacher_profiles)
          const { data: schoolTeachers, error: teacherError } = await supabase
            .from("teacher_profiles")
            .select("id")
            .eq("school_id", adminProfile.school_id);

          if (teacherError) {
            console.error('❌ Classroom Management: Error fetching school teachers:', teacherError);
            setError(`Failed to fetch school teachers: ${teacherError.message}`);
          } else if (schoolTeachers && schoolTeachers.length > 0) {
            const teacherIds = schoolTeachers.map(t => t.id);
            console.log('👨‍🏫 Classroom Management: School teacher IDs:', teacherIds);
            
            const { data: schoolClassrooms, error } = await supabase
              .from("classrooms")
              .select("*")
              .in("teacher_id", teacherIds);
              
            if (error) {
              console.error('❌ Classroom Management: Error fetching school classrooms:', error);
              setError(`Failed to fetch classrooms: ${error.message}`);
            } else {
              foundClassrooms = schoolClassrooms || [];
              console.log(`✅ Classroom Management: Admin loaded ${foundClassrooms.length} classrooms`);
            }
          } else {
            console.log('⚠️ Classroom Management: No teachers found for school');
            foundClassrooms = [];
          }
        } else {
          // Fallback: try to get all classrooms if no school_id
          console.log('⚠️ Admin has no school_id, attempting fallback');
          const { data: allClassrooms, error } = await supabase
            .from("classrooms")
            .select("*")
            .limit(50); // Limit for safety
            
          if (error) {
            console.error('❌ Error in fallback classroom fetch:', error);
            setError(`Failed to fetch classrooms: ${error.message}`);
          } else {
            foundClassrooms = allClassrooms || [];
            console.log(`✅ Admin fallback loaded ${foundClassrooms.length} classrooms`);
          }
        }
      } else if (userRoles?.some((r) => r.role === "teacher")) {
        determinedRole = "teacher";
        console.log('👨‍🏫 Classroom Management: Loading classrooms for teacher');
        
        // Teacher: fetch classrooms where teacher_id matches teacher_profiles.id
        const { data: teacherProfile, error: teacherError } = await supabase
          .from("teacher_profiles")
          .select("id, school_id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (teacherError) {
          console.error('❌ Classroom Management: Error fetching teacher profile:', teacherError);
          setError(`Failed to fetch teacher profile: ${teacherError.message}`);
        } else if (teacherProfile) {
          console.log('📋 Classroom Management: Teacher profile:', teacherProfile);
          const { data: teacherClassrooms, error } = await supabase
            .from("classrooms")
            .select("*")
            .eq("teacher_id", teacherProfile.id);
            
          if (error) {
            console.error('❌ Classroom Management: Error fetching teacher classrooms:', error);
            setError(`Failed to fetch classrooms: ${error.message}`);
          } else {
            foundClassrooms = teacherClassrooms || [];
            console.log(`✅ Classroom Management: Teacher loaded ${foundClassrooms.length} classrooms`);
          }
        } else {
          console.log('❌ Classroom Management: No teacher profile found');
          setError('Teacher profile not found');
        }
      } else if (userRoles?.some((r) => r.role === "student")) {
        determinedRole = "student";
        console.log('👨‍🎓 Classroom Management: Loading classrooms for student');
        
        // Student: get student id for user, fetch from classroom_students mapping
        const { data: studentProfile, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (studentError) {
          console.error('❌ Classroom Management: Error fetching student profile:', studentError);
          setError(`Failed to fetch student profile: ${studentError.message}`);
        } else if (studentProfile?.id) {
          console.log('📋 Classroom Management: Student profile:', studentProfile);
          const { data: mappings, error: mappingError } = await supabase
            .from("classroom_students")
            .select(`
              classroom_id,
              classrooms (
                *
              )
            `)
            .eq("student_id", studentProfile.id);
            
          if (mappingError) {
            console.error('❌ Classroom Management: Error fetching student classrooms:', mappingError);
            setError(`Failed to fetch classrooms: ${mappingError.message}`);
          } else {
            // Extract classrooms
            foundClassrooms = (mappings || [])
              .map((m: any) => m.classrooms)
              .filter(Boolean);
            console.log(`✅ Classroom Management: Student loaded ${foundClassrooms.length} classrooms`);
          }
        } else {
          console.log('❌ Classroom Management: No student profile found');
          setError('Student profile not found');
        }
      } else {
        console.log('❌ Classroom Management: User has no recognized role');
        setError('User role not recognized');
        determinedRole = null;
      }

      console.log(`🎯 Classroom Management: Final result: ${foundClassrooms.length} classrooms for role: ${determinedRole}`);
      setUserRole(determinedRole);
      setClassrooms(foundClassrooms);
      
    } catch (error: any) {
      console.error('💥 Classroom Management: Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Unexpected error: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load classrooms: ${errorMessage}`,
      });
      setClassrooms([]);
    } finally {
      console.log('🏁 Classroom Management: Setting loading to false');
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    refreshClassrooms();
  }, [refreshClassrooms]);

  const handleClassroomCreated = (classroom: any) => {
    setClassrooms((prev) => [...prev, classroom]);
    setSelectedClassroom(classroom);
  };
  
  const handleDeleteClassroom = (classroomId: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== classroomId));
    if (selectedClassroom?.id === classroomId) {
      setSelectedClassroom(null);
    }
  };

  return {
    classrooms,
    loading,
    error,
    userRole,
    selectedClassroom,
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom,
    refreshClassrooms,
  };
};
