
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Users, Settings, Grid, Calendar, Trash2 } from "lucide-react";
import { SeatingChart } from "@/components/seating/SeatingChart";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { InviteStudents } from "./InviteStudents";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
  onDelete?: (classroomId: string) => void;
}

export const ClassroomGrid = ({ classroom, onDelete }: ClassroomGridProps) => {
  const [showSeating, setShowSeating] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteClass = async () => {
    if (!classroom.id) return;
    
    setIsDeleting(true);
    try {
      // Delete related records first (class_invitations)
      await supabase
        .from('class_invitations')
        .delete()
        .eq('classroom_id', classroom.id);

      // Delete classroom_students records
      await supabase
        .from('classroom_students')
        .delete()
        .eq('classroom_id', classroom.id);

      // Delete seating arrangements
      await supabase
        .from('seating_arrangements')
        .delete()
        .eq('classroom_id', classroom.id);

      // Delete attendance records
      await supabase
        .from('attendance')
        .delete()
        .eq('classroom_id', classroom.id);
      
      // Finally, delete the classroom
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', classroom.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${classroom.name} has been deleted`,
      });
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(classroom.id);
      }
    } catch (error: any) {
      console.error("Error deleting classroom:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom: " + error.message,
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
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
              <div className="flex space-x-2">
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#25293A] border border-purple-500/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {classroom.name}</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the classroom 
                        and all associated data including seating arrangements, invitations, and 
                        student enrollments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-purple-500/30 hover:bg-purple-600/20 text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteClass}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <Users className="w-4 h-4 mr-2" />
              <span>{studentCount} students</span>
            </div>
            
            {userRole === 'teacher' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                  onClick={() => setShowInvite(!showInvite)}
                  className={showInvite ? "bg-purple-900/20" : ""}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSeating(!showSeating)}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  View Seating
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
    </div>
  );
};
