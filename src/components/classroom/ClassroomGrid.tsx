
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { SeatingChart } from "@/components/seating/SeatingChart";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { InviteStudents } from "./InviteStudents";
import { ClassroomHeader } from "./ClassroomHeader";
import { StudentCountIndicator } from "./StudentCountIndicator";
import { ClassroomActions } from "./ClassroomActions";
import { useClassroomData } from "./useClassroomData";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
  onDelete?: (classroomId: string) => void;
}

export const ClassroomGrid = ({ classroom, onDelete = () => {} }: ClassroomGridProps) => {
  const [showSeating, setShowSeating] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const { userRole, studentCount } = useClassroomData(classroom.id);

  const toggleSeating = () => setShowSeating(!showSeating);
  const toggleAttendance = () => setShowAttendance(!showAttendance);
  const toggleInvite = () => setShowInvite(!showInvite);

  return (
    <div className="space-y-4">
      <Card className="p-4 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <ClassroomHeader
            name={classroom.name}
            description={classroom.description}
            id={classroom.id}
            userRole={userRole}
            onDelete={onDelete}
          />
          
          <div className="mt-auto">
            <StudentCountIndicator count={studentCount} />
            
            <ClassroomActions 
              userRole={userRole}
              showSeating={showSeating}
              showAttendance={showAttendance}
              showInvite={showInvite}
              onToggleSeating={toggleSeating}
              onToggleAttendance={toggleAttendance}
              onToggleInvite={toggleInvite}
            />
          </div>

          {showInvite && userRole === 'teacher' && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <InviteStudents classroomId={classroom.id} />
            </div>
          )}
        </div>
      </Card>

      {showAttendance && userRole === 'teacher' && (
        <Card className="p-4">
          <AttendanceTracker classroomId={classroom.id} />
        </Card>
      )}

      {showSeating && (
        <Card className="p-4">
          <SeatingChart classroomId={classroom.id} />
        </Card>
      )}
    </div>
  );
};
