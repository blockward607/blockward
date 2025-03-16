
import { Button } from "@/components/ui/button";
import { Grid, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClassroomActionsProps {
  userRole: string | null;
  classroomId: string;
}

export const ClassroomActions = ({
  userRole,
  classroomId
}: ClassroomActionsProps) => {
  const navigate = useNavigate();
  
  const handleSeatingClick = () => {
    navigate(`/classroom/${classroomId}/seating`);
  };
  
  const handleAttendanceClick = () => {
    navigate(`/classroom/${classroomId}/attendance`);
  };
  
  const handleInviteClick = () => {
    navigate(`/classroom/${classroomId}/invite`);
  };

  if (userRole === 'teacher') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleAttendanceClick}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Attendance
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSeatingClick}
        >
          <Grid className="w-4 h-4 mr-2" />
          Seating
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleInviteClick}
        >
          <Users className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleSeatingClick}
      >
        <Grid className="w-4 h-4 mr-2" />
        View Seating
      </Button>
    </div>
  );
};
