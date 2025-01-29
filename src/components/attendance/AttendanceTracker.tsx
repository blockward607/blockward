import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "./AttendanceStatus";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentList } from "./StudentList";
import { AttendanceCharts } from "./AttendanceCharts";

interface Student {
  id: string;
  name: string;
  status?: AttendanceStatus;
}

export const AttendanceTracker = ({ classroomId }: { classroomId: string }) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchAttendanceData();
  }, [classroomId]);

  const fetchStudents = async () => {
    try {
      const { data: classroomStudents, error } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          students (
            id,
            name
          )
        `)
        .eq('classroom_id', classroomId);

      if (error) throw error;

      if (classroomStudents) {
        const formattedStudents = classroomStudents.map((cs) => ({
          id: cs.students.id,
          name: cs.students.name,
          status: 'present' as AttendanceStatus
        }));
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

  const fetchAttendanceData = async () => {
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('classroom_id', classroomId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (attendance) {
      const chartData = attendance.reduce((acc: any, curr: any) => {
        const date = new Date(curr.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { 
            date, 
            present: 0, 
            absent: 0, 
            late: 0, 
            authorized: 0 
          };
        }
        acc[date][curr.status] += 1;
        return acc;
      }, {});

      setAttendanceData(Object.values(chartData));
    }
  };

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status }
        : student
    ));
  };

  const submitAttendance = async () => {
    const attendanceRecords = students.map(student => ({
      student_id: student.id,
      classroom_id: classroomId,
      status: student.status,
      date: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('attendance')
      .insert(attendanceRecords);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit attendance"
      });
    } else {
      toast({
        title: "Success",
        description: "Attendance submitted successfully"
      });
      fetchAttendanceData();
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
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="chart">Bar Chart</TabsTrigger>
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <StudentList 
            students={students}
            updateStudentStatus={updateStudentStatus}
            onSubmit={submitAttendance}
          />
        </TabsContent>

        <TabsContent value="chart">
          <AttendanceCharts attendanceData={attendanceData} />
        </TabsContent>

        <TabsContent value="pie">
          <AttendanceCharts attendanceData={attendanceData} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};