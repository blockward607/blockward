
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Users, Settings, Grid, Calendar, Bell, Award, Book, ChartBar } from "lucide-react";
import { SeatingChart } from "@/components/seating/SeatingChart";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { InviteStudents } from "./InviteStudents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
}

export const ClassroomGrid = ({ classroom }: ClassroomGridProps) => {
  const [showSeating, setShowSeating] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showBehavior, setShowBehavior] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchStudentCount();
  }, [classroom.id]);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      setUserRole(roleData?.role || null);
    }
  };

  const fetchStudentCount = async () => {
    const { count } = await supabase
      .from('classroom_students')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroom.id);
    
    setStudentCount(count || 0);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{classroom.name}</h3>
              <p className="text-sm text-gray-400">{classroom.description}</p>
            </div>
            {userRole === 'teacher' && (
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <Users className="w-4 h-4 mr-2" />
              <span>{studentCount} students</span>
            </div>
            
            {userRole === 'teacher' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAttendance(!showAttendance)}
                  className={showAttendance ? "bg-purple-900/20" : ""}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Attendance
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSeating(!showSeating)}
                  className={showSeating ? "bg-purple-900/20" : ""}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Seating
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBehavior(!showBehavior)}
                  className={showBehavior ? "bg-purple-900/20" : ""}
                >
                  <ChartBar className="w-4 h-4 mr-2" />
                  Behavior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInvite(!showInvite)}
                  className={showInvite ? "bg-purple-900/20" : ""}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSeating(!showSeating)}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  View Seating
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {}}
                >
                  <Award className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
              </div>
            )}
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

      {showBehavior && userRole === 'teacher' && (
        <Card className="p-4">
          <BehaviorTracker />
        </Card>
      )}
    </div>
  );
};
