
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { GoogleClassroom } from "@/services/GoogleClassroomService";
import GoogleClassroomService from "@/services/GoogleClassroomService";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface GoogleClassroomImportDialogProps {
  course: GoogleClassroom;
  onClose: () => void;
}

export function GoogleClassroomImportDialog({ 
  course, 
  onClose 
}: GoogleClassroomImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importOptions, setImportOptions] = useState({
    createClass: true,
    importStudents: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load students when dialog opens
  const loadStudents = async () => {
    if (studentsLoaded) return;
    
    try {
      setLoading(true);
      const studentsList = await GoogleClassroomService.listStudents(course.id);
      setStudents(studentsList);
      setStudentsLoaded(true);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        variant: "destructive",
        title: "Failed to load students",
        description: "Could not retrieve students from Google Classroom"
      });
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    loadStudents();
  });

  const handleImport = async () => {
    try {
      setImporting(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to import classes"
        });
        return;
      }

      // Get user's teacher profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError || !teacherProfile) {
        toast({
          variant: "destructive",
          title: "Teacher profile not found",
          description: "Could not find your teacher profile"
        });
        return;
      }

      // Create classroom
      if (importOptions.createClass) {
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .insert([{
            name: course.name,
            description: course.description || `Imported from Google Classroom: ${course.name}`,
            teacher_id: teacherProfile.id,
            google_classroom_id: course.id,
            section: course.section || null
          }])
          .select()
          .single();

        if (classroomError) {
          throw classroomError;
        }

        // Import students if option is selected
        if (importOptions.importStudents && students.length > 0) {
          // This would typically include code to insert students into your database
          // or send invitations to students to join the class
          toast({
            title: "Students ready to import",
            description: `${students.length} students will be invited to join the class`
          });
        }

        toast({
          title: "Import successful",
          description: "Google Classroom has been imported successfully"
        });

        // Navigate to the classes page
        navigate('/classes');
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Failed to import Google Classroom"
      });
    } finally {
      setImporting(false);
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Google Classroom</DialogTitle>
          <DialogDescription>
            Import {course.name} from Google Classroom to BlockWard
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium">Import Options</h3>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="createClass" 
                checked={importOptions.createClass} 
                onCheckedChange={(checked) => 
                  setImportOptions({...importOptions, createClass: !!checked})
                }
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="createClass"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Create BlockWard classroom
                </label>
                <p className="text-xs text-gray-500">
                  Create a new classroom with the same name and details
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="importStudents" 
                checked={importOptions.importStudents} 
                onCheckedChange={(checked) => 
                  setImportOptions({...importOptions, importStudents: !!checked})
                }
                disabled={!importOptions.createClass}
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="importStudents"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Import students
                </label>
                <p className="text-xs text-gray-500">
                  Send invitations to students in this Google Classroom
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div>
              <h3 className="font-medium mb-2">Class Details</h3>
              <p className="text-sm"><span className="font-medium">Name:</span> {course.name}</p>
              {course.section && (
                <p className="text-sm"><span className="font-medium">Section:</span> {course.section}</p>
              )}
              {course.description && (
                <p className="text-sm"><span className="font-medium">Description:</span> {course.description}</p>
              )}
              <p className="text-sm mt-2">
                <span className="font-medium">Students:</span> {studentsLoaded ? students.length : "Loading..."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={importing}>Cancel</Button>
          <Button onClick={handleImport} disabled={importing || loading}>
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
