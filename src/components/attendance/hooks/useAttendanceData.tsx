
import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AttendanceStatus } from "../AttendanceStatus";
import { useClassroomStudents } from "@/hooks/use-classroom-students";

type Student = {
  id: string;
  name: string;
  status?: AttendanceStatus;
}

export const useAttendanceData = (classroomId: string, selectedDate: Date) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  
  const refreshData = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
    
    toast({
      title: "Refreshed",
      description: "Attendance data has been refreshed"
    });
  };
  
  return {
    students,
    loading,
    studentsLoading,
    saving, 
    setSaving,
    refreshing,
    isTeacher,
    updateStudentStatus,
    handleSaveAttendance,
    refreshData
  };
};
