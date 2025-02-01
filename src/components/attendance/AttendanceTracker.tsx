import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "./AttendanceStatus";
import { useToast } from "@/hooks/use-toast";
import { StudentList } from "./StudentList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface Student {
  id: string;
  name: string;
  status?: AttendanceStatus;
}

export const AttendanceTracker = ({ classroomId }: { classroomId: string }) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [teacherProfile, setTeacherProfile] = useState<{ id: string } | null>(null);

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

        if (roleData?.role === 'teacher') {
          const { data: profile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setTeacherProfile(profile);
        }
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students for classroom:', classroomId);
      
      const { data: classroomStudents, error: classroomError } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          students (
            id,
            name
          )
        `)
        .eq('classroom_id', classroomId);

      if (classroomError) {
        console.error('Error fetching classroom students:', classroomError);
        throw classroomError;
      }

      console.log('Fetched classroom students:', classroomStudents);

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
        const formattedStudents = classroomStudents.map((cs) => ({
          id: cs.students.id,
          name: cs.students.name,
          status: (attendanceRecords?.find(
            (record) => record.student_id === cs.student_id
          )?.status as AttendanceStatus) || 'present'
        }));
        
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

  const addNewStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a student name"
      });
      return;
    }

    if (userRole !== 'teacher' || !teacherProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only teachers can add students"
      });
      return;
    }

    try {
      console.log('Creating new student:', newStudentName);
      
      // First create the student
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert([{ 
          name: newStudentName.trim(),
          points: 0
        }])
        .select()
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        throw studentError;
      }

      console.log('Student created successfully:', newStudent);

      // Then add them to the classroom
      const { error: classroomError } = await supabase
        .from('classroom_students')
        .insert([{
          classroom_id: classroomId,
          student_id: newStudent.id,
        }]);

      if (classroomError) {
        console.error('Error adding student to classroom:', classroomError);
        throw classroomError;
      }

      toast({
        title: "Success",
        description: "Student added successfully"
      });

      setNewStudentName("");
      setShowAddStudent(false);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
    }
  };

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
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Students</h2>
          {!showAddStudent ? (
            <Button 
              variant="outline" 
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter student name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-64"
              />
              <Button onClick={addNewStudent}>Add</Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowAddStudent(false);
                  setNewStudentName("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      <StudentList 
        students={students}
        updateStudentStatus={updateStudentStatus}
        isTeacher={userRole === 'teacher'}
      />
    </Card>
  );
};