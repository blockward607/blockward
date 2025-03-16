
import { Card } from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyClassStateProps {
  userRole: string | null;
}

export const EmptyClassState = ({ userRole }: EmptyClassStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-8 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
        <div className="text-center text-gray-300 space-y-4">
          {userRole === 'teacher' ? (
            <>
              <BookOpen className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
              <p className="text-xl">No classes created yet. Create your first class to get started!</p>
            </>
          ) : (
            <>
              <Users className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
              <p className="text-xl">You're not enrolled in any classes yet.</p>
              <p className="text-gray-400">Join a class with an invitation code to get started.</p>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
