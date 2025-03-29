
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { School } from "lucide-react";

export interface GoogleClassroomImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleClassroomImportDialog: React.FC<GoogleClassroomImportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Google Classroom</DialogTitle>
          <DialogDescription>
            Connect your Google Classroom account to import your classes
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 flex flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-purple-800/30 p-4">
            <School className="h-8 w-8 text-purple-300" />
          </div>
          <p className="text-center mb-4">
            You will be redirected to Google to authorize this application to
            access your Google Classroom data.
          </p>
        </div>
        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled>
            Connect Google Classroom
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
