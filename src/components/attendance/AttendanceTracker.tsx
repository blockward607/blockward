import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare, Clock, AlertTriangle } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  name: string;
  status?: AttendanceStatus;
}

const COLORS = ['#4ade80', '#f87171', '#fbbf24', '#60a5fa'];

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
    return <div>Loading...</div>;
  }

  const getPieChartData = () => {
    const totals = {
      present: 0,
      absent: 0,
      late: 0,
      authorized: 0
    };

    attendanceData.forEach(day => {
      totals.present += day.present;
      totals.absent += day.absent;
      totals.late += day.late;
      totals.authorized += day.authorized;
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckSquare className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XSquare className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'authorized':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
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
          <div className="space-y-4">
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found in this classroom
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                    <span>{student.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {student.status && getStatusIcon(student.status)}
                    <AttendanceStatusSelect
                      value={student.status || 'present'}
                      onChange={(status) => updateStudentStatus(student.id, status)}
                    />
                  </div>
                </div>
              ))
            )}
            {students.length > 0 && (
              <Button 
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={submitAttendance}
              >
                Submit Attendance
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chart">
          <div className="w-full overflow-x-auto">
            <BarChart
              width={800}
              height={400}
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
        </TabsContent>

        <TabsContent value="pie">
          <div className="w-full flex justify-center">
            <PieChart width={400} height={400}>
              <Pie
                data={getPieChartData()}
                cx={200}
                cy={200}
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
