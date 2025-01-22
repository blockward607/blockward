import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Users, Settings } from "lucide-react";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
}

export const ClassroomGrid = ({ classroom }: ClassroomGridProps) => {
  return (
    <Card className="p-4 glass-card hover:bg-purple-900/10 transition-all">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{classroom.name}</h3>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">{classroom.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span>0 students</span>
          </div>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </div>
    </Card>
  );
};