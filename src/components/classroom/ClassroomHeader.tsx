
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { DeleteClassroomDialog } from "./DeleteClassroomDialog";

interface ClassroomHeaderProps {
  name: string;
  description: string;
  id: string;
  userRole: string | null;
  onDelete: (classroomId: string) => void;
}

export const ClassroomHeader = ({ 
  name, 
  description, 
  id, 
  userRole, 
  onDelete 
}: ClassroomHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {userRole === 'teacher' && (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <DeleteClassroomDialog
            classroomId={id}
            classroomName={name}
            onDelete={onDelete}
          />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
