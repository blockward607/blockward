
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateClassroomDialog } from "./CreateClassroomDialog";

interface ClassesPageHeaderProps {
  userRole: string | null;
  onClassroomCreated: (classroom: any) => void;
}

export const ClassesPageHeader = ({ userRole, onClassroomCreated }: ClassesPageHeaderProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Debug logging
  console.log("ClassesPageHeader - userRole:", userRole);
  console.log("ClassesPageHeader - should show create button:", userRole === 'teacher');
  console.log("ClassesPageHeader - dialog open:", showCreateDialog);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Create Class button clicked");
    setShowCreateDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    console.log("Dialog state changing to:", open);
    setShowCreateDialog(open);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">My Classes</h1>
        <p className="text-gray-400 mt-1">
          {userRole === 'teacher' ? 'Manage your classes and students' : 'View your enrolled classes'}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        {userRole === 'teacher' && (
          <Button 
            onClick={handleCreateClick}
            className="w-full sm:w-auto flex gap-2 bg-purple-600 hover:bg-purple-700 relative z-10 cursor-pointer"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Create Class
          </Button>
        )}
        {/* Debug info - remove this after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-2">
            Debug: Role = {userRole || 'null'}, Dialog = {showCreateDialog ? 'open' : 'closed'}
          </div>
        )}
      </div>
      
      <CreateClassroomDialog 
        open={showCreateDialog}
        onOpenChange={handleDialogClose}
        onClassroomCreated={onClassroomCreated}
      />
    </div>
  );
};
