
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/attendance/DatePicker";
import { StudentList } from "@/components/attendance/StudentList";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { AttendanceStatus } from "@/components/attendance/AttendanceStatus";
import { useClassroomStudents } from "@/hooks/use-classroom-students";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Download, Save } from "lucide-react";

interface AttendanceTrackerProps {
  classroomId: string;
}

type Student = {
  id: string;
  name: string;
  status?: AttendanceStatus;
}

export const AttendanceTracker = ({ classroomId }: AttendanceTrackerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const { students: classroomStudents, loading: studentsLoading } = useClassroomStudents(classroomId);
  const [students, setStudents] = useState<Student[]>([]);
  const { toast } = useToast();
  
  const fetchAttendanceData = useCallback(async () => {
    if (!classroomId || !selectedDate) return;
    
    try {
      setLoading(true);
      
      // Format date to YYYY-MM-DD for the database query
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if user is a teacher
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      setIsTeacher(!!teacherProfile);
      
      // Get attendance records for the selected date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('date', formattedDate);
        
      if (attendanceError) throw attendanceError;
      
      // Map the classroom students to include their attendance status
      if (classroomStudents) {
        const updatedStudents = classroomStudents.map(student => {
          const attendanceRecord = attendanceData?.find(record => record.student_id === student.id);
          return {
            id: student.id,
            name: student.name,
            status: (attendanceRecord?.status as AttendanceStatus) || 'present',
          };
        });
        
        setStudents(updatedStudents);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance data"
      });
    } finally {
      setLoading(false);
    }
  }, [classroomId, selectedDate, classroomStudents, toast]);
  
  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const updateStudentStatus = async (studentId: string, status: AttendanceStatus) => {
    if (!isTeacher) return;
    
    try {
      // Update locally first for immediate UI feedback
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === studentId ? { ...student, status } : student
        )
      );
      
      // Format date to YYYY-MM-DD for the database
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if a record already exists
      const { data: existingRecord, error: queryError } = await supabase
        .from('attendance')
        .select('id')
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId)
        .eq('date', formattedDate)
        .maybeSingle();
        
      if (queryError) throw queryError;
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existingRecord.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('attendance')
          .insert([{
            classroom_id: classroomId,
            student_id: studentId,
            date: formattedDate,
            status
          }]);
          
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating attendance status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update attendance status"
      });
    }
  };
  
  const handleSaveAttendance = async () => {
    if (!isTeacher) return;
    
    try {
      setSaving(true);
      
      // Format date to YYYY-MM-DD for the database
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Prepare batch upsert data
      const attendanceRecords = students.map(student => ({
        classroom_id: classroomId,
        student_id: student.id,
        date: formattedDate,
        status: student.status || 'present'
      }));
      
      // Remove existing records for the date
      const { error: deleteError } = await supabase
        .from('attendance')
        .delete()
        .eq('classroom_id', classroomId)
        .eq('date', formattedDate);
        
      if (deleteError) throw deleteError;
      
      // Insert all records at once
      const { error: insertError } = await supabase
        .from('attendance')
        .insert(attendanceRecords);
        
      if (insertError) throw insertError;
      
      toast({
        title: "Success",
        description: "Attendance saved successfully"
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attendance data"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
    
    toast({
      title: "Refreshed",
      description: "Attendance data has been refreshed"
    });
  };
  
  const exportToCsv = () => {
    try {
      // Generate CSV header
      let csv = 'Student Name,Status,Date\n';
      
      // Add rows
      students.forEach(student => {
        const row = `"${student.name}","${student.status || 'present'}","${format(selectedDate, 'yyyy-MM-dd')}"\n`;
        csv += row;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export attendance data"
      });
    }
  };
  
  if (studentsLoading && students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh attendance data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          {isTeacher && (
            <>
              <Button 
                variant="outline" 
                size="icon"
                onClick={exportToCsv}
                title="Export as CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={handleSaveAttendance}
                disabled={saving || students.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="space-y-4">
          <StudentList 
            students={students} 
            updateStudentStatus={updateStudentStatus}
            isTeacher={isTeacher}
          />
          
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          <AttendanceStats students={students} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
