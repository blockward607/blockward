import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatusSelect, AttendanceStatus } from "./AttendanceStatus";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

export const AttendanceTracker = ({ classroomId }: { classroomId: string }) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchAttendanceData();
  }, [classroomId]);

  const fetchStudents = async () => {
    const { data: classroomStudents } = await supabase
      .from('classroom_students')
      .select('student_id, students(*)')
      .eq('classroom_id', classroomId);

    if (classroomStudents) {
      const studentsWithAttendance = classroomStudents.map((cs) => ({
        ...cs.students,
        status: 'present' as AttendanceStatus
      }));
      setStudents(studentsWithAttendance);
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
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Attendance Chart */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
          <div className="w-full overflow-x-auto">
            <BarChart
              width={500}
              height={300}
              data={attendanceData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#4ade80" name="Present" />
              <Bar dataKey="absent" fill="#f87171" name="Absent" />
              <Bar dataKey="late" fill="#fbbf24" name="Late" />
              <Bar dataKey="authorized" fill="#60a5fa" name="Authorized" />
            </BarChart>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
              >
                <span>{student.name}</span>
                <AttendanceStatusSelect
                  value={student.status}
                  onChange={(status) => updateStudentStatus(student.id, status)}
                />
              </div>
            ))}
          </div>
          <Button 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            onClick={submitAttendance}
          >
            Submit Attendance
          </Button>
        </div>
      </div>
    </Card>
  );
};