import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "./AttendanceStatus";
import { useToast } from "@/hooks/use-toast";
import { StudentList } from "./StudentList";
import { AddStudent } from "./AddStudent";
import { useClassroomStudents } from "@/hooks/use-classroom-students";

export const AttendanceTracker = ({ classroomId }: { classroomId: string }) => {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { students, setStudents, loading, fetchStudents } = useClassroomStudents(classroomId);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setUserRole(roleData?.role || null);
      }
    };

    checkUserRole();
  }, []);

  const updateStudentStatus = async (studentId: string, status: AttendanceStatus) => {
    if (userRole !== 'teacher') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only teachers can update attendance"
      });
      return;
    }

    try {
      console.log('Updating student status:', { studentId, status });
      
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          classroom_id: classroomId,
          status,
          date: today
        });

      if (error) throw error;

      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, status }
          : student
      ));

      toast({
        title: "Success",
        description: "Attendance status updated"
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update attendance"
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-40">
          <p>Loading students...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {userRole === 'teacher' && (
        <AddStudent 
          classroomId={classroomId}
          onStudentAdded={fetchStudents}
        />
      )}
      <StudentList 
        students={students}
        updateStudentStatus={updateStudentStatus}
        isTeacher={userRole === 'teacher'}
      />
    </Card>
  );
};