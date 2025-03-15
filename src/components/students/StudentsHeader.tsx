
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { InviteStudentDialog } from "@/components/students/invite";

interface StudentsHeaderProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
}

export const StudentsHeader = ({ onAddStudent }: StudentsHeaderProps) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
          <Users className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text">Students</h1>
      </div>
      
      <InviteStudentDialog onAddStudent={onAddStudent} />
    </motion.div>
  );
};
