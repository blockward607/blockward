
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface DeleteClassroomDialogProps {
  classroomId: string;
  classroomName: string;
  onDelete: (classroomId: string) => void;
}

export const DeleteClassroomDialog = ({ 
  classroomId, 
  classroomName, 
  onDelete 
}: DeleteClassroomDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteClass = async () => {
    if (!classroomId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing classroom ID",
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log("Deleting classroom:", classroomId);
      
      // Delete related records first (class_invitations)
      const { error: invitationsError } = await supabase
        .from('class_invitations')
        .delete()
        .eq('classroom_id', classroomId);
        
      if (invitationsError) {
        console.error("Error deleting invitations:", invitationsError);
        // Continue with other deletions even if this fails
      }

      // Delete classroom_students records
      const { error: studentsError } = await supabase
        .from('classroom_students')
        .delete()
        .eq('classroom_id', classroomId);
        
      if (studentsError) {
        console.error("Error deleting classroom students:", studentsError);
        // Continue with other deletions even if this fails
      }

      // Delete seating arrangements
      const { error: seatingError } = await supabase
        .from('seating_arrangements')
        .delete()
        .eq('classroom_id', classroomId);
        
      if (seatingError) {
        console.error("Error deleting seating arrangements:", seatingError);
        // Continue with other deletions even if this fails
      }

      // Delete attendance records
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('classroom_id', classroomId);
        
      if (attendanceError) {
        console.error("Error deleting attendance records:", attendanceError);
        // Continue with other deletions even if this fails
      }
      
      // Finally, delete the classroom
      const { error: classroomError } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', classroomId);
      
      if (classroomError) {
        throw classroomError;
      }
      
      console.log("Classroom deleted successfully");
      
      toast({
        title: "Success",
        description: `${classroomName} has been deleted`,
      });
      
      // Call the onDelete callback to update UI
      onDelete(classroomId);
      
      // Close dialog after successful deletion
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error deleting classroom:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom: " + error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#25293A] border border-purple-500/30">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {classroomName}</AlertDialogTitle>
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
            onClick={(e) => {
              e.preventDefault();
              handleDeleteClass();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
