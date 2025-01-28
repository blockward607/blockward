import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { Card } from "@/components/ui/card";

const Attendance = () => {
  // For demo purposes, using a static classroom ID
  const classroomId = "123e4567-e89b-12d3-a456-426614174000";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Attendance Tracking</h1>
      </div>
      <AttendanceTracker classroomId={classroomId} />
    </div>
  );
};

export default Attendance;