
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "./AttendanceStatus";
import { useToast } from "@/hooks/use-toast";
import { StudentList } from "./StudentList";
import { useClassroomStudents } from "@/hooks/use-classroom-students";
import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "./DatePicker";
import { AttendanceStats } from "./AttendanceStats";

export const AttendanceTracker = ({ classroomId }: { classroomId: string }) => {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { students, setStudents, loading, fetchStudents } = useClassroomStudents(classroomId);
  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, any>[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, classroomId]);

  const fetchAttendanceForDate = async (date: string) => {
    try {
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('date', date);

      if (error) throw error;

      // Update students with their attendance status for this date
      const updatedStudents = students.map(student => {
        const attendance = attendanceData?.find(record => 
          record.student_id === student.id
        );
        return {
          ...student,
          status: attendance?.status || 'present'
        };
      });
      
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance data"
      });
    }
  };

  const fetchAttendanceHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('classroom_id', classroomId)
        .order('date', { ascending: false });

      if (error) throw error;
      setAttendanceHistory(data || []);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance history"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStudents();
    await fetchAttendanceForDate(format(selectedDate, 'yyyy-MM-dd'));
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Attendance data has been refreshed"
    });
  };

  const exportAttendance = () => {
    try {
      // Create CSV content
      let csvContent = "Student Name,Date,Status\n";
      
      students.forEach(student => {
        csvContent += `"${student.name}",${format(selectedDate, 'yyyy-MM-dd')},"${student.status || 'present'}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exported",
        description: "Attendance data has been exported as CSV"
      });
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export attendance data"
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
      
      const today = format(selectedDate, 'yyyy-MM-dd');
      
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

  useEffect(() => {
    // Load attendance history when component mounts
    fetchAttendanceHistory();
  }, []);

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
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <DatePicker 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate} 
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {userRole === 'teacher' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportAttendance}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
          
          <StudentList 
            students={students}
            updateStudentStatus={updateStudentStatus}
            isTeacher={userRole === 'teacher'}
          />
        </TabsContent>
        
        <TabsContent value="statistics">
          <AttendanceStats 
            classroomId={classroomId} 
            attendanceHistory={attendanceHistory}
            isLoading={isLoadingHistory}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
