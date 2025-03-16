
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { CreateClassroomDialog } from "./CreateClassroomDialog";
import { Database } from "@/integrations/supabase/types";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

export interface ClassesPageHeaderProps {
  userRole: string | null;
  onClassroomCreated: (newClassroom: Classroom) => void;
}

export const ClassesPageHeader = ({ userRole, onClassroomCreated }: ClassesPageHeaderProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
          <BookOpen className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text">
          {userRole === 'teacher' ? 'My Classes' : 'Enrolled Classes'}
        </h1>
      </div>
      
      {userRole === 'teacher' && (
        <CreateClassroomDialog onClassroomCreated={onClassroomCreated} />
      )}
    </motion.div>
  );
};
