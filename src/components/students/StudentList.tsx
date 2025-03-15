
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { StudentCard } from "./StudentCard";

export interface Student {
  id: string;
  name: string;
  points: number;
  created_at: string;
  school?: string;
}

interface StudentListProps {
  students: Student[];
  onDeleteStudent: (id: string) => void;
}

export const StudentList = ({ students, onDeleteStudent }: StudentListProps) => {
  // Animation variants
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
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (students.length === 0) {
    return (
      <motion.div variants={itemVariants} className="col-span-full">
        <Card className="p-8 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
          <div className="text-center text-gray-300 space-y-4">
            <Users className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
            <p className="text-xl">No students added yet</p>
            <p className="text-gray-400">Add students using the button above</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {students.map((student) => (
        <motion.div
          key={student.id}
          variants={itemVariants}
        >
          <StudentCard 
            id={student.id}
            name={student.name}
            school={student.school}
            points={student.points}
            onDelete={onDeleteStudent}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
