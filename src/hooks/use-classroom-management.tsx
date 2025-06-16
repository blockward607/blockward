
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
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        console.log('No user found');
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('Loading classrooms for user:', { userId: user.id, email: user.email });

      // Determine user role(s)
      const { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleError) {
        console.error('Error fetching user roles:', roleError);
        setError('Failed to fetch user roles');
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('User roles for classrooms:', userRoles);

      let determinedRole: "teacher" | "student" | "admin" | null = null;
      let foundClassrooms: any[] = [];

      if (userRoles?.some((r) => r.role === "admin")) {
        determinedRole = "admin";
        console.log('Loading classrooms for admin');
        
        // Admin: Get all classrooms for their school
        const { data: adminProfile, error: adminError } = await supabase
          .from("admin_profiles")
          .select("school_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminError) {
          console.error('Error fetching admin profile:', adminError);
          setError('Failed to fetch admin profile');
          setClassrooms([]);
          setUserRole(determinedRole);
          setLoading(false);
          return;
        }

        console.log('Admin profile for classrooms:', adminProfile);

        if (adminProfile?.school_id) {
          // Get all classrooms for the school (need to link through teacher_profiles)
          const { data: schoolTeachers, error: teacherError } = await supabase
            .from("teacher_profiles")
            .select("id")
            .eq("school_id", adminProfile.school_id);

          if (teacherError) {
            console.error('Error fetching school teachers:', teacherError);
            setError('Failed to fetch school teachers');
            foundClassrooms = [];
          } else if (schoolTeachers && schoolTeachers.length > 0) {
            const teacherIds = schoolTeachers.map(t => t.id);
            const { data: schoolClassrooms, error } = await supabase
              .from("classrooms")
              .select("*")
              .in("teacher_id", teacherIds);
              
            if (error) {
              console.error('Error fetching school classrooms:', error);
              setError(`Failed to fetch classrooms: ${error.message}`);
              foundClassrooms = [];
            } else {
              foundClassrooms = schoolClassrooms || [];
              console.log(`Admin loaded ${foundClassrooms.length} classrooms`);
            }
          } else {
            console.log('No teachers found for school');
            foundClassrooms = [];
          }
        } else {
          console.log('Admin has no school_id');
          setError('Admin profile missing school assignment');
          foundClassrooms = [];
        }
      } else if (userRoles?.some((r) => r.role === "teacher")) {
        determinedRole = "teacher";
        console.log('Loading classrooms for teacher');
        
        // Teacher: fetch classrooms where teacher_id matches teacher_profiles.id
        const { data: teacherProfile, error: teacherError } = await supabase
          .from("teacher_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (teacherError) {
          console.error('Error fetching teacher profile:', teacherError);
          setError('Failed to fetch teacher profile');
          foundClassrooms = [];
        } else if (teacherProfile) {
          console.log('Teacher profile for classrooms:', teacherProfile);
          const { data: teacherClassrooms, error } = await supabase
            .from("classrooms")
            .select("*")
            .eq("teacher_id", teacherProfile.id);
            
          if (error) {
            console.error('Error fetching teacher classrooms:', error);
            setError(`Failed to fetch classrooms: ${error.message}`);
            foundClassrooms = [];
          } else {
            foundClassrooms = teacherClassrooms || [];
            console.log(`Teacher loaded ${foundClassrooms.length} classrooms`);
          }
        } else {
          console.log('No teacher profile found');
          setError('Teacher profile not found');
          foundClassrooms = [];
        }
      } else if (userRoles?.some((r) => r.role === "student")) {
        determinedRole = "student";
        console.log('Loading classrooms for student');
        
        // Student: get student id for user, fetch from classroom_students mapping
        const { data: studentProfile, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (studentError) {
          console.error('Error fetching student profile:', studentError);
          setError('Failed to fetch student profile');
          foundClassrooms = [];
        } else if (studentProfile?.id) {
          console.log('Student profile for classrooms:', studentProfile);
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
            console.error('Error fetching student classrooms:', mappingError);
            setError(`Failed to fetch classrooms: ${mappingError.message}`);
            foundClassrooms = [];
          } else {
            // Extract classrooms
            foundClassrooms = (mappings || [])
              .map((m: any) => m.classrooms)
              .filter(Boolean);
            console.log(`Student loaded ${foundClassrooms.length} classrooms`);
          }
        } else {
          console.log('No student profile found');
          setError('Student profile not found');
          foundClassrooms = [];
        }
      } else {
        console.log('User has no recognized role');
        setError('User role not recognized');
        determinedRole = null;
        foundClassrooms = [];
      }

      console.log(`Final classroom result: ${foundClassrooms.length} classrooms for role: ${determinedRole}`);
      setUserRole(determinedRole);
      setClassrooms(foundClassrooms);
      
    } catch (error: any) {
      console.error('Unexpected error loading classrooms:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load classrooms",
      });
      setClassrooms([]);
    } finally {
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
