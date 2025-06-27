
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClassroomsList } from "@/components/classroom/ClassroomsList";
import { ClassesPageHeader } from "@/components/classroom/ClassesPageHeader";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { JoinClassButton } from "@/components/student/JoinClassButton";
import { useAuth } from "@/hooks/use-auth";
import { useClassroomManagement } from "@/hooks/use-classroom-management";
import { JoinClassProvider } from "@/components/classroom/join/JoinClassContext";

const Classes = () => {
  const { userRole } = useAuth();
  const { 
    classrooms, 
    loading, 
    handleDeleteClassroom,
    selectedClassroom,
    setSelectedClassroom,
    refreshClassrooms
  } = useClassroomManagement();

  const handleClassroomCreated = () => {
    refreshClassrooms();
  };

  const handleClassroomJoined = () => {
    refreshClassrooms();
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
        {/* Header - different for students vs teachers */}
        {userRole === 'student' ? (
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text">My Classes</h1>
              <p className="text-gray-400 mt-2">View your enrolled classes and join new ones</p>
            </div>
            <JoinClassButton onClassJoined={handleClassroomJoined} />
          </div>
        ) : (
          <ClassesPageHeader 
            userRole={userRole} 
            onClassroomCreated={handleClassroomCreated}
          />
        )}
        
        {/* Legacy join class section for backward compatibility */}
        {userRole === 'student' && (
          <JoinClassSection />
        )}
        
        <ClassroomsList 
          classrooms={classrooms}
          userRole={userRole}
          onDelete={userRole === 'teacher' ? handleDeleteClassroom : undefined}
          onSelect={setSelectedClassroom}
          selectedClassroom={selectedClassroom}
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
