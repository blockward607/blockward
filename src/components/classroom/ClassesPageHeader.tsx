
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, School } from "lucide-react";
import { CreateClassroomDialog } from "./CreateClassroomDialog";
import { Link } from "react-router-dom";

interface ClassesPageHeaderProps {
  userRole: string | null;
  onClassroomCreated: (classroom: any) => void;
}

export const ClassesPageHeader = ({ userRole, onClassroomCreated }: ClassesPageHeaderProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">My Classes</h1>
        <p className="text-gray-400 mt-1">Manage your classes and students</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        {userRole === 'teacher' && (
          <>
            <Link to="/google-classroom">
              <Button variant="outline" className="w-full sm:w-auto flex gap-2">
                <School className="h-4 w-4" />
                Google Classroom
              </Button>
            </Link>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="w-full sm:w-auto flex gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Class
            </Button>
          </>
        )}
      </div>
      
      {showCreateDialog && (
        <CreateClassroomDialog 
          onOpenChange={setShowCreateDialog}
          onClassroomCreated={onClassroomCreated}
        />
      )}
    </div>
  );
};
