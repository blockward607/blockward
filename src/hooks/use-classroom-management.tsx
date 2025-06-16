
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export const useClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
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

      if (userRoles?.some((r) => r.role === "teacher")) {
        setUserRole("teacher");
        // Teacher: fetch all classrooms where teacher_id matches teacher_profiles.id
        const { data: teacherProfile } = await supabase
          .from("teacher_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        const { data: foundClassrooms, error } = await supabase
          .from("classrooms")
          .select("*")
          .eq("teacher_id", teacherProfile?.id);
        if (error) throw error;
        setClassrooms(foundClassrooms || []);
      } else if (userRoles?.some((r) => r.role === "student")) {
        setUserRole("student");
        // Student: get student id for user, fetch from classroom_students mapping
        const { data: studentProfile } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!studentProfile?.id) {
          setClassrooms([]);
          setLoading(false);
          return;
        }
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
        const mappedClassrooms = (mappings || [])
          .map((m: any) => m.classrooms)
          .filter(Boolean);
        setClassrooms(mappedClassrooms);
      } else {
        setUserRole(null);
        setClassrooms([]);
      }
    } catch (error: any) {
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

  // These methods can be implemented further as needed
  // For now, just include the most critical ones
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
