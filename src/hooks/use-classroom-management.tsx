
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
        setClassrooms([]);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Determine user role(s)
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      let determinedRole: "teacher" | "student" | "admin" | null = null;
      let foundClassrooms: any[] = [];

      if (userRoles?.some((r) => r.role === "admin")) {
        determinedRole = "admin";
        
        // Admin: Get all classrooms for their school
        const { data: adminProfile } = await supabase
          .from("admin_profiles")
          .select("school_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminProfile?.school_id) {
          // Get all classrooms for the school (need to link through teacher_profiles)
          const { data: schoolTeachers } = await supabase
            .from("teacher_profiles")
            .select("id")
            .eq("school_id", adminProfile.school_id);

          if (schoolTeachers && schoolTeachers.length > 0) {
            const teacherIds = schoolTeachers.map(t => t.id);
            const { data: schoolClassrooms, error } = await supabase
              .from("classrooms")
              .select("*")
              .in("teacher_id", teacherIds);
              
            if (error) throw error;
            foundClassrooms = schoolClassrooms || [];
          }
        }
      } else if (userRoles?.some((r) => r.role === "teacher")) {
        determinedRole = "teacher";
        
        // Teacher: fetch classrooms where teacher_id matches teacher_profiles.id
        const { data: teacherProfile } = await supabase
          .from("teacher_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (teacherProfile) {
          const { data: teacherClassrooms, error } = await supabase
            .from("classrooms")
            .select("*")
            .eq("teacher_id", teacherProfile.id);
            
          if (error) throw error;
          foundClassrooms = teacherClassrooms || [];
        }
      } else if (userRoles?.some((r) => r.role === "student")) {
        determinedRole = "student";
        
        // Student: get student id for user, fetch from classroom_students mapping
        const { data: studentProfile } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (studentProfile?.id) {
          const { data: mappings, error: mappingError } = await supabase
            .from("classroom_students")
            .select(`
              classroom_id,
              classrooms (
                *
              )
            `)
            .eq("student_id", studentProfile.id);
            
          if (mappingError) throw mappingError;
          
          // Extract classrooms
          foundClassrooms = (mappings || [])
            .map((m: any) => m.classrooms)
            .filter(Boolean);
        }
      }

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
