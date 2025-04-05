
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { School, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGoogleClassroom } from "./hooks/useGoogleClassroom";
import { GoogleClassroomCourseList } from "@/components/google-classroom/GoogleClassroomCourseList";
import type { GoogleClassroom } from "@/services/google-classroom";

export interface GoogleClassroomImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleClassroomImportDialog: React.FC<GoogleClassroomImportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { 
    googleClassrooms, 
    loadingClassrooms, 
    fetchGoogleClassrooms, 
    isAuthenticated,
    authenticateWithGoogle
  } = useGoogleClassroom(user?.id);
  
  const [selectedCourse, setSelectedCourse] = useState<GoogleClassroom | null>(null);

  const handleImport = async (course: GoogleClassroom) => {
    setSelectedCourse(course);
    // In a real implementation, you might save this to your database
    // For now, just close the dialog after selecting
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Google Classroom</DialogTitle>
          <DialogDescription>
            Connect your Google Classroom account to import your classes
          </DialogDescription>
        </DialogHeader>
        
        {!isAuthenticated ? (
          <div className="p-4 flex flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-purple-800/30 p-4">
              <School className="h-8 w-8 text-purple-300" />
            </div>
            <p className="text-center mb-4">
              You will be redirected to Google to authorize this application to
              access your Google Classroom data.
            </p>
            <DialogFooter className="flex space-x-2 sm:space-x-0 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={authenticateWithGoogle} 
                disabled={loadingClassrooms}
                className="w-full sm:w-auto"
              >
                {loadingClassrooms ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Google Classroom"
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="py-2">
              <GoogleClassroomCourseList 
                courses={googleClassrooms} 
                onImport={handleImport} 
                onRefresh={fetchGoogleClassrooms}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
