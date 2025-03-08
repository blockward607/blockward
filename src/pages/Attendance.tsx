
import { useEffect, useState } from "react";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";

const Attendance = () => {
  const [userClassrooms, setUserClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserClassrooms = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        const userRole = roleData?.role;
        
        if (userRole === 'teacher') {
          // For teachers, get all classrooms they teach
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
          
          if (teacherProfile) {
            const { data: classrooms, error } = await supabase
              .from('classrooms')
              .select('*')
              .eq('teacher_id', teacherProfile.id);
            
            if (error) throw error;
            
            setUserClassrooms(classrooms || []);
            if (classrooms && classrooms.length > 0) {
              setSelectedClassroom(classrooms[0].id);
            }
          }
        } else {
          // For students, get classrooms they're enrolled in
          const { data: studentData } = await supabase
            .from('students')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
          
          if (studentData) {
            const { data: enrollments, error } = await supabase
              .from('classroom_students')
              .select(`
                classroom_id,
                classrooms (*)
              `)
              .eq('student_id', studentData.id);
            
            if (error) throw error;
            
            if (enrollments) {
              const classrooms = enrollments.map(enrollment => enrollment.classrooms);
              setUserClassrooms(classrooms as any[]);
              if (classrooms.length > 0) {
                setSelectedClassroom((classrooms[0] as any).id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserClassrooms();
  }, []);

  const handleClassroomChange = (classroomId: string) => {
    setSelectedClassroom(classroomId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading classrooms...</p>
      </div>
    );
  }

  if (userClassrooms.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Attendance Tracking</h1>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-medium mb-2">No Classrooms Found</h2>
            <p className="text-muted-foreground">
              You need to be part of at least one classroom to track attendance.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Attendance Tracking</h1>
        
        <Select
          value={selectedClassroom || undefined}
          onValueChange={handleClassroomChange}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a classroom" />
          </SelectTrigger>
          <SelectContent>
            {userClassrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedClassroom ? (
        <AttendanceTracker classroomId={selectedClassroom} />
      ) : (
        <Card className="p-6">
          <div className="text-center py-8">
            <p>Please select a classroom to view attendance</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
