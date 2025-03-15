
import React from "react";
import { DatePicker } from "@/components/attendance/DatePicker";
import { AttendanceActions } from "./AttendanceActions";

interface AttendanceHeaderProps {
  selectedDate: Date;
  isTeacher: boolean;
  saving: boolean;
  refreshing: boolean;
  students: any[];
  onDateChange: (date: Date) => void;
  handleSaveAttendance: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AttendanceHeader = ({
  selectedDate,
  isTeacher,
  saving,
  refreshing,
  students,
  onDateChange,
  handleSaveAttendance,
  refreshData
}: AttendanceHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <DatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
      <AttendanceActions
        isTeacher={isTeacher}
        saving={saving}
        refreshing={refreshing}
        students={students}
        selectedDate={selectedDate}
        handleSaveAttendance={handleSaveAttendance}
        refreshData={refreshData}
      />
    </div>
  );
};
