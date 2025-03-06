
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LoadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoadingDialog = ({ open, onOpenChange }: LoadingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Processing...</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
