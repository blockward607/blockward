
import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";
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
        <div className="p-4 rounded-full bg-purple-900/50 shadow-[0_0_25px_rgba(147,51,234,0.6)] animate-pulse relative">
          <Users className="w-8 h-8 text-purple-300" />
          <Sparkles className="w-4 h-4 text-purple-200 absolute top-2 right-1" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text relative">
          Students
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></span>
        </h1>
      </div>
      
      <InviteStudentDialog onAddStudent={onAddStudent} />
    </motion.div>
  );
};
