
import { Button } from "@/components/ui/button";
import { Grid, Calendar, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ClassroomActionsProps {
  userRole: string | null;
  classroomId: string;
}

export const ClassroomActions = ({
  userRole,
  classroomId
}: ClassroomActionsProps) => {
  const navigate = useNavigate();
  
  const handleSeatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Navigating to seating plan for classroom: ${classroomId}`);
    toast.success("Navigating to seating plan");
    navigate(`/classroom/${classroomId}/seating`);
  };
  
  const handleAttendanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Navigating to attendance for classroom: ${classroomId}`);
    toast.success("Navigating to attendance");
    navigate(`/classroom/${classroomId}/attendance`);
  };
  
  const handleInviteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Navigating to invite for classroom: ${classroomId}`);
    toast.success("Navigating to invite students");
    navigate(`/classroom/${classroomId}/invite`);
  };

  const handleClassDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Navigating to class details for classroom: ${classroomId}`);
    toast.success("Navigating to class details");
    navigate(`/class/${classroomId}`);
  };

  if (userRole === 'teacher') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClassDetailsClick}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Details
        </Button>
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
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleClassDetailsClick}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Details
      </Button>
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
