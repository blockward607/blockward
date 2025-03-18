
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { ClassroomHeader } from "./ClassroomHeader";
import { StudentCountIndicator } from "./StudentCountIndicator";
import { ClassroomActions } from "./ClassroomActions";
import { useClassroomData } from "./useClassroomData";
import { useNavigate } from "react-router-dom";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
  onDelete?: (classroomId: string) => void;
}

export const ClassroomGrid = ({ classroom, onDelete = () => {} }: ClassroomGridProps) => {
  const { userRole, studentCount } = useClassroomData(classroom.id);
  const navigate = useNavigate();

  const handleCardClick = () => {
    console.log(`Card clicked for classroom: ${classroom.id}`);
    navigate(`/class/${classroom.id}`);
  };

  return (
    <div className="space-y-4">
      <Card 
        className="p-4 glass-card hover:bg-purple-900/10 transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex flex-col h-full">
          <ClassroomHeader
            name={classroom.name}
            description={classroom.description}
            id={classroom.id}
            userRole={userRole}
            onDelete={onDelete}
          />
          
          <div className="mt-auto">
            <StudentCountIndicator count={studentCount} />
            
            <ClassroomActions 
              userRole={userRole}
              classroomId={classroom.id}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
