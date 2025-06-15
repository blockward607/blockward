import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceContent } from "./components/AttendanceContent";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { Button } from "@/components/ui/button";
import { QuickAttendancePanel } from "./QuickAttendancePanel";

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

  // Quick attendance mode for teachers (single-character, step through students with P/A)
  const [quickMode, setQuickMode] = useState(false);
  const [quickResults, setQuickResults] = useState<{ [studentId: string]: "present" | "absent" }>({});

  const handleQuickDone = (results: { [studentId: string]: "present" | "absent" }) => {
    // Save via updateStudentStatus for each student
    Object.entries(results).forEach(([id, status]) => {
      updateStudentStatus(id, status);
    });
    setQuickResults(results);
    setQuickMode(false);
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
      <div className="flex justify-between items-center">
        <span />
        {isTeacher && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setQuickMode((m) => !m)}
            className="mb-2"
          >
            {quickMode ? "Switch to Standard UI" : "Quick Attendance (P/A)"}
          </Button>
        )}
      </div>
      {quickMode && isTeacher ? (
        <QuickAttendancePanel
          students={students}
          onAttendance={handleQuickDone}
        />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
