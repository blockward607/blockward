
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GoogleClassroom } from "@/services/google-classroom";
import { ImportOptions } from "./ImportOptions";
import { ClassDetails } from "./ClassDetails";
import { useImportDialog } from "./hooks/useImportDialog";
import { ClassJoinService } from "@/services/class-join";

interface GoogleClassroomImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: GoogleClassroom;
}

export function GoogleClassroomImportDialog({ 
  open, 
  onOpenChange,
  course 
}: GoogleClassroomImportDialogProps) {
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  
  // If no course is selected yet, show loading or empty state
  if (!course) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Import Google Classroom</DialogTitle>
            <DialogDescription>
              Select a Google Classroom course to import
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">No course selected</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // If a course is selected, use the useImportDialog hook
  const {
    loading,
    students,
    studentsLoaded,
    importing,
    importOptions,
    setImportOptions,
    handleImport,
    loadStudents
  } = useImportDialog(course, () => onOpenChange(false));
  
  // Load students when component mounts
  useEffect(() => {
    if (course && !studentsLoaded) {
      loadStudents();
    }
  }, [course, studentsLoaded]);
  
  // Function to handle direct join to Google Classroom
  const handleDirectJoin = async () => {
    try {
      setJoining(true);
      console.log("Attempting to join Google Classroom directly with code:", course.enrollmentCode || course.id);
      
      // Try with enrollment code first, fallback to ID
      const classCode = course.enrollmentCode || course.id;
      
      if (!classCode) {
        toast.error("This classroom doesn't have a valid enrollment code");
        return;
      }
      
      // Use the class join service to join directly with the code
      const { data: matchData, error: matchError } = 
        await ClassJoinService.findClassroomOrInvitation(classCode);
      
      if (matchError || !matchData) {
        console.log("No local match found, creating new class...");
        // If no match, proceed with normal import flow
        await handleImport();
        return;
      }
      
      // If we found a match, attempt to enroll the student
      const { data: enrollData, error: enrollError } = 
        await ClassJoinService.enrollStudent(matchData.classroomId, matchData.invitationId);
      
      if (enrollError) {
        console.error("Error joining classroom:", enrollError);
        toast.error(enrollError.message || "Could not join this classroom");
        return;
      }
      
      // Success!
      toast.success(`You've successfully joined ${course.name}`);
      
      // Navigate to class details page
      navigate(`/class/${matchData.classroomId}`);
      
    } catch (error) {
      console.error("Error joining Google Classroom directly:", error);
      toast.error("An error occurred while joining the classroom");
    } finally {
      setJoining(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Google Classroom: {course.name}</DialogTitle>
          <DialogDescription>
            Join or import this Google Classroom
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <ImportOptions 
            importOptions={importOptions} 
            setImportOptions={setImportOptions}
            onImport={() => {}} // Add empty function to satisfy the type
            onSelectCourse={() => {}} // Add empty function to satisfy the type
          />

          <ClassDetails 
            course={course} 
            loading={loading} 
            students={students} 
            studentsLoaded={studentsLoaded} 
          />
        </div>

        <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing || joining}>
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              onClick={handleDirectJoin} 
              disabled={importing || joining}
              className="flex-1"
            >
              {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {joining ? "Joining..." : "Join Class"}
            </Button>
            
            <Button 
              onClick={handleImport} 
              disabled={importing || joining || loading}
              className="flex-1"
            >
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {importing ? "Importing..." : "Import Class"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
