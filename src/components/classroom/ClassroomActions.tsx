
import { Button } from "@/components/ui/button";
import { Grid, Calendar, Users } from "lucide-react";

interface ClassroomActionsProps {
  userRole: string | null;
  showSeating: boolean;
  showAttendance: boolean;
  showInvite: boolean;
  onToggleSeating: () => void;
  onToggleAttendance: () => void;
  onToggleInvite: () => void;
}

export const ClassroomActions = ({
  userRole,
  showSeating,
  showAttendance,
  showInvite,
  onToggleSeating,
  onToggleAttendance,
  onToggleInvite
}: ClassroomActionsProps) => {
  if (userRole === 'teacher') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleAttendance}
          className={showAttendance ? "bg-purple-900/20" : ""}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Attendance
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleSeating}
          className={showSeating ? "bg-purple-900/20" : ""}
        >
          <Grid className="w-4 h-4 mr-2" />
          Seating
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleInvite}
          className={showInvite ? "bg-purple-900/20" : ""}
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
        onClick={onToggleSeating}
      >
        <Grid className="w-4 h-4 mr-2" />
        View Seating
      </Button>
    </div>
  );
};
