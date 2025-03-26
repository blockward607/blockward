
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoogleClassroom } from "@/services/google-classroom";
import { ImportOptions } from "./ImportOptions";
import { ClassDetails } from "./ClassDetails";
import { useImportDialog } from "./useImportDialog";

interface GoogleClassroomImportDialogProps {
  course: GoogleClassroom;
  onClose: () => void;
}

export function GoogleClassroomImportDialog({ 
  course, 
  onClose 
}: GoogleClassroomImportDialogProps) {
  const {
    loading,
    students,
    studentsLoaded,
    importing,
    importOptions,
    setImportOptions,
    handleImport
  } = useImportDialog(course, onClose);

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
          <ImportOptions 
            importOptions={importOptions} 
            setImportOptions={setImportOptions} 
          />

          <ClassDetails 
            course={course} 
            loading={loading} 
            students={students} 
            studentsLoaded={studentsLoaded} 
          />
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
