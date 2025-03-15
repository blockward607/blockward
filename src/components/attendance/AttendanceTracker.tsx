
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceContent } from "./components/AttendanceContent";
import { useAttendanceData } from "./hooks/useAttendanceData";

interface AttendanceTrackerProps {
  classroomId: string;
}

export const AttendanceTracker = ({ classroomId }: AttendanceTrackerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { 
    students, 
    loading, 
    studentsLoading, 
    saving, 
    refreshing, 
    isTeacher, 
    updateStudentStatus, 
    handleSaveAttendance, 
    refreshData 
  } = useAttendanceData(classroomId, selectedDate);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  if (studentsLoading && students.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <AttendanceHeader 
        selectedDate={selectedDate}
        isTeacher={isTeacher}
        saving={saving}
        refreshing={refreshing}
        students={students}
        onDateChange={handleDateChange}
        handleSaveAttendance={handleSaveAttendance}
        refreshData={refreshData}
      />
      
      <AttendanceContent 
        students={students}
        loading={loading}
        isTeacher={isTeacher}
        updateStudentStatus={updateStudentStatus}
      />
    </div>
  );
};
