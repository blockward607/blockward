
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
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (classrooms.length === 0) {
    return <EmptyClassState userRole={userRole} />;
  }

  // Student = colored grid, teacher = as before.
  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden"
      animate="show"
      className={userRole === "student" 
        ? "grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        : "grid grid-cols-1 gap-6"
      }
    >
      {classrooms.map((classroom) => (
        <motion.div 
          key={classroom.id} 
          variants={itemVariants}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onClick={() => userRole === 'teacher' && onSelect(classroom)}
          className={userRole === "student"
            ? "rounded-xl"
            : "shadow-lg"
          }
        >
          <ClassroomGrid 
            classroom={classroom} 
            onDelete={onDelete} 
            userRole={userRole}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
