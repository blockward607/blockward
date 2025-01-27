import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Users, Settings, Grid, Calendar } from "lucide-react";
import { useState } from "react";
import { SeatingChart } from "@/components/seating/SeatingChart";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { InviteStudents } from "./InviteStudents";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
}

export const ClassroomGrid = ({ classroom }: ClassroomGridProps) => {
  const [showSeating, setShowSeating] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="p-4 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{classroom.name}</h3>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">{classroom.description}</p>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-400">
              <Users className="w-4 h-4 mr-2" />
              <span>0 students</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAttendance(!showAttendance)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Attendance
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSeating(!showSeating)}
              >
                <Grid className="w-4 h-4 mr-2" />
                Seating
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowInvite(!showInvite)}
              >
                <Users className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>

          {showInvite && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <InviteStudents classroomId={classroom.id} />
            </div>
          )}
        </div>
      </Card>

      {showAttendance && (
        <AttendanceTracker classroomId={classroom.id} />
      )}

      {showSeating && (
        <SeatingChart classroomId={classroom.id} />
      )}
    </div>
  );
};