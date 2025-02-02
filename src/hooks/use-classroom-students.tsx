import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "@/components/attendance/AttendanceStatus";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email?: string;
  status?: AttendanceStatus;
}

export const useClassroomStudents = (classroomId: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      console.log('Fetching students for classroom:', classroomId);
      
      const { data: classroomStudents, error: classroomError } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          students (
            id,
            name,
            user_id
          )
        `)
        .eq('classroom_id', classroomId);

      if (classroomError) {
        console.error('Error fetching classroom students:', classroomError);
        throw classroomError;
      }

      console.log('Fetched classroom students:', classroomStudents);

      // Fetch user emails for students that have user accounts
      const userIds = classroomStudents
        ?.map(cs => cs.students.user_id)
        .filter(id => id) || [];

      const { data: userProfiles, error: profilesError } = await supabase
        .from('auth.users')
        .select('id, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        throw profilesError;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance records:', attendanceError);
        throw attendanceError;
      }

      console.log('Fetched attendance records:', attendanceRecords);

      if (classroomStudents) {
        const formattedStudents = classroomStudents.map((cs) => {
          const userProfile = userProfiles?.find(
            up => up.id === cs.students.user_id
          );
          
          return {
            id: cs.students.id,
            name: cs.students.name,
            email: userProfile?.email,
            status: (attendanceRecords?.find(
              (record) => record.student_id === cs.student_id
            )?.status as AttendanceStatus) || 'present'
          };
        });
        
        console.log('Formatted students:', formattedStudents);
        setStudents(formattedStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  return { students, setStudents, loading, fetchStudents };
};