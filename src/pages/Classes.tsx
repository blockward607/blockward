import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { InviteStudents } from "@/components/classroom/InviteStudents";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { ClassesPageHeader } from "@/components/classroom/ClassesPageHeader";
import { ClassroomsList } from "@/components/classroom/ClassroomsList";
import { ClassesLoading } from "@/components/classroom/ClassesLoading";
import { useClassroomManagement } from "@/hooks/use-classroom-management";
import { EmptyClassState } from "@/components/classroom/EmptyClassState";
import { toast } from "sonner";
import { useState } from "react";
import { JoinClassModal } from "@/components/classroom/join/JoinClassModal";

const Classes = () => {
  const { 
    classrooms, 
    loading, 
    userRole, 
    selectedClassroom, 
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom,
    refreshClassrooms
  } = useClassroomManagement();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  useEffect(() => {
    // Force refresh classrooms data when visiting the Classes page
    refreshClassrooms();
    
    // Check for error in state from a failed join attempt
    if (location.state && location.state.errorMessage) {
      toast.error(location.state.errorMessage);
      
      // Clear the error from state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [refreshClassrooms, location.pathname, navigate, location.state]);

  if (loading) {
    return <ClassesLoading />;
  }

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
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 container px-4 sm:px-6 mx-auto max-w-6xl"
    >
      <ClassesPageHeader 
        userRole={userRole} 
        onClassroomCreated={handleClassroomCreated} 
      />
      {userRole === 'student' && (
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="flex items-center px-5 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            + Join Class
          </button>
          <JoinClassModal open={joinModalOpen} onOpenChange={setJoinModalOpen} />
        </div>
      )}
      {/* Removed: <JoinClassSection /> */}
      
      {selectedClassroom && userRole === 'teacher' && (
        <motion.div variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Invite Students to {selectedClassroom.name}
            </h2>
            <InviteStudents classroomId={selectedClassroom.id} />
          </div>
        </motion.div>
      )}

      {classrooms && classrooms.length > 0 ? (
        <ClassroomsList 
          classrooms={classrooms} 
          userRole={userRole} 
          onDelete={handleDeleteClassroom}
          onSelect={setSelectedClassroom}
          selectedClassroom={selectedClassroom}
        />
      ) : (
        <EmptyClassState userRole={userRole} />
      )}
    </motion.div>
  );
};

export default Classes;
