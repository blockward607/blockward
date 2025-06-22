
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClassroomsList } from "@/components/classroom/ClassroomsList";
import { ClassesPageHeader } from "@/components/classroom/ClassesPageHeader";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { useAuth } from "@/hooks/use-auth";
import { useClassroomData } from "@/components/classroom/useClassroomData";
import { JoinClassProvider } from "@/components/classroom/join/JoinClassContext";

const Classes = () => {
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { classrooms, loading } = useClassroomData(refreshTrigger);

  const handleClassroomCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClassroomJoined = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <JoinClassProvider>
      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-8 relative z-10"
      >
        <ClassesPageHeader 
          userRole={userRole} 
          onClassroomCreated={handleClassroomCreated}
        />
        
        {userRole === 'student' && (
          <JoinClassSection onClassroomJoined={handleClassroomJoined} />
        )}
        
        <ClassroomsList 
          classrooms={classrooms}
          loading={loading}
          userRole={userRole}
        />
        
        {/* Decorative elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="hexagon absolute top-40 right-40 w-64 h-64 bg-gradient-to-r from-purple-700/20 to-purple-400/10"></div>
          <div className="hexagon absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-r from-purple-600/20 to-purple-300/10"></div>
        </div>
      </motion.div>
    </JoinClassProvider>
  );
};

export default Classes;
