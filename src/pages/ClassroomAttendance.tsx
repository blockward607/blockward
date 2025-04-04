
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";

const ClassroomAttendance = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();

  if (!classroomId) {
    return <div>Classroom ID is required</div>;
  }

  return (
    <div className="container px-4 py-6 max-w-6xl">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classrooms
        </Button>
        <h1 className="text-3xl font-bold gradient-text">Attendance Tracker</h1>
      </div>
      
      <div className="w-full">
        <AttendanceTracker classroomId={classroomId} />
      </div>
    </div>
  );
};

export default ClassroomAttendance;
