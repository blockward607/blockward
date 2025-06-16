
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export const useClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"teacher" | "student" | "admin" | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<any | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshClassrooms = useCallback(async () => {
    setLoading(true);

    try {
      if (!user) {
        console.log('No user found');
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Determine user role(s)
      const { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleError) {
        console.error('Error fetching user roles:', roleError);
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      let determinedRole: "teacher" | "student" | "admin" | null = null;
      let foundClassrooms: any[] = [];

      if (userRoles?.some((r) => r.role === "admin")) {
        determinedRole = "admin";
        
        // Admin: Get all classrooms for their school
        const { data: adminProfile, error: adminError } = await supabase
          .from("admin_profiles")
          .select("school_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminError) {
          console.error('Error fetching admin profile:', adminError);
          setClassrooms([]);
          setUserRole(determinedRole);
          setLoading(false);
          return;
        }

        if (adminProfile?.school_id) {
          // Get all classrooms for the school (need to link through teacher_profiles)
          const { data: schoolTeachers, error: teacherError } = await supabase
            .from("teacher_profiles")
            .select("id")
            .eq("school_id", adminProfile.school_id);

          if (teacherError) {
            console.error('Error fetching school teachers:', teacherError);
            foundClassrooms = [];
          } else if (schoolTeachers && schoolTeachers.length > 0) {
            const teacherIds = schoolTeachers.map(t => t.id);
            const { data: schoolClassrooms, error } = await supabase
              .from("classrooms")
              .select("*")
              .in("teacher_id", teacherIds);
              
            if (error) {
              console.error('Error fetching school classrooms:', error);
              foundClassrooms = [];
            } else {
              foundClassrooms = schoolClassrooms || [];
            }
          } else {
            console.log('No teachers found for school');
            foundClassrooms = [];
          }
        } else {
          console.log('Admin has no school_id');
          foundClassrooms = [];
        }
      } else if (userRoles?.some((r) => r.role === "teacher")) {
        determinedRole = "teacher";
        
        // Teacher: fetch classrooms where teacher_id matches teacher_profiles.id
        const { data: teacherProfile, error: teacherError } = await supabase
          .from("teacher_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (teacherError) {
          console.error('Error fetching teacher profile:', teacherError);
          foundClassrooms = [];
        } else if (teacherProfile) {
          const { data: teacherClassrooms, error } = await supabase
            .from("classrooms")
            .select("*")
            .eq("teacher_id", teacherProfile.id);
            
          if (error) {
            console.error('Error fetching teacher classrooms:', error);
            foundClassrooms = [];
          } else {
            foundClassrooms = teacherClassrooms || [];
          }
        } else {
          console.log('No teacher profile found');
          foundClassrooms = [];
        }
      } else if (userRoles?.some((r) => r.role === "student")) {
        determinedRole = "student";
        
        // Student: get student id for user, fetch from classroom_students mapping
        const { data: studentProfile, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (studentError) {
          console.error('Error fetching student profile:', studentError);
          foundClassrooms = [];
        } else if (studentProfile?.id) {
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
            foundClassrooms = [];
          } else {
            // Extract classrooms
            foundClassrooms = (mappings || [])
              .map((m: any) => m.classrooms)
              .filter(Boolean);
          }
        } else {
          console.log('No student profile found');
          foundClassrooms = [];
        }
      } else {
        console.log('User has no recognized role');
        determinedRole = null;
        foundClassrooms = [];
      }

      console.log(`Found ${foundClassrooms.length} classrooms for role: ${determinedRole}`);
      setUserRole(determinedRole);
      setClassrooms(foundClassrooms);
      
    } catch (error: any) {
      console.error('Error loading classrooms:', error);
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
    userRole,
    selectedClassroom,
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom,
    refreshClassrooms,
  };
};
