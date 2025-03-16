
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

export const useClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("useClassroomManagement hook initialized");
    checkUserRoleAndFetchData();
  }, []);

  const checkUserRoleAndFetchData = async () => {
    try {
      console.log("Checking user session...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        setLoading(false);
        return;
      }

      console.log("Session found, checking user role");
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get user role"
        });
        setLoading(false);
        return;
      }

      const role = roleData?.role || null;
      console.log("User role:", role);
      setUserRole(role);

      if (role === 'teacher') {
        console.log("Fetching teacher's classrooms");
        await fetchTeacherClassrooms(session.user.id);
      } else if (role === 'student') {
        console.log("Fetching student's enrolled classrooms");
        await fetchStudentClassrooms(session.user.id);
      }
    } catch (error: any) {
      console.error('Error in checkUserRoleAndFetchData:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClassrooms = async (userId: string) => {
    try {
      // Fetch teacher's profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching teacher profile:", profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load teacher profile"
        });
        return;
      }

      if (teacherProfile) {
        const { data: classroomsData, error } = await supabase
          .from('classrooms')
          .select('*')
          .eq('teacher_id', teacherProfile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching classrooms:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classrooms"
          });
        } else {
          console.log(`Fetched ${classroomsData?.length || 0} classrooms`);
          setClassrooms(classroomsData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching teacher classrooms:", error);
      throw error;
    }
  };

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
        return;
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
          return;
        }

        console.log(`Fetched ${enrolledClassrooms?.length || 0} enrolled classrooms`);
        
        // Extract classroom data from the joined result
        if (enrolledClassrooms && enrolledClassrooms.length > 0) {
          const extractedClassrooms = enrolledClassrooms
            .map(ec => ec.classroom)
            .filter(classroom => classroom !== null) as Classroom[];
            
          console.log("Extracted classrooms:", extractedClassrooms);
          setClassrooms(extractedClassrooms);
        } else {
          setClassrooms([]);
        }
      }
    } catch (error) {
      console.error("Error fetching student classrooms:", error);
      throw error;
    }
  };

  const handleClassroomCreated = (newClassroom: Classroom) => {
    setClassrooms([newClassroom, ...classrooms]);
    setSelectedClassroom(newClassroom);
    toast({
      title: "Success",
      description: `Classroom "${newClassroom.name}" created successfully`
    });
  };

  const handleDeleteClassroom = (classroomId: string) => {
    // Filter out the deleted classroom
    setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
    
    // If the deleted classroom was selected, clear the selection
    if (selectedClassroom && selectedClassroom.id === classroomId) {
      setSelectedClassroom(null);
    }
    
    toast({
      title: "Success",
      description: "Classroom deleted successfully"
    });
  };

  return {
    classrooms,
    loading,
    userRole,
    selectedClassroom,
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom
  };
};
