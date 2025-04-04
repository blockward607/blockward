
import { motion } from "framer-motion";
import { ClassroomGrid } from "./ClassroomGrid";
import { EmptyClassState } from "./EmptyClassState";
import { Database } from "@/integrations/supabase/types";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomsListProps {
  classrooms: Classroom[];
  userRole: string | null;
  onDelete: (classroomId: string) => void;
  onSelect: (classroom: Classroom | null) => void;
  selectedClassroom: Classroom | null;
}

export const ClassroomsList = ({ 
  classrooms, 
  userRole, 
  onDelete, 
  onSelect,
  selectedClassroom
}: ClassroomsListProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  console.log("ClassroomsList rendering with:", { 
    classroomsCount: classrooms.length,
    classrooms: classrooms
  });

  if (classrooms.length === 0) {
    return <EmptyClassState userRole={userRole} />;
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6"
    >
      {classrooms.map((classroom) => (
        <motion.div 
          key={classroom.id} 
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onClick={() => userRole === 'teacher' && onSelect(classroom)}
          className="shadow-lg"
        >
          <ClassroomGrid 
            classroom={classroom} 
            onDelete={onDelete} 
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
