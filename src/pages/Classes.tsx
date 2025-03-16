
import { useEffect } from "react";
import { motion } from "framer-motion";
import { InviteStudents } from "@/components/classroom/InviteStudents";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { ClassesPageHeader } from "@/components/classroom/ClassesPageHeader";
import { ClassroomsList } from "@/components/classroom/ClassroomsList";
import { ClassesLoading } from "@/components/classroom/ClassesLoading";
import { useClassroomManagement } from "@/hooks/use-classroom-management";
import { useToast } from "@/hooks/use-toast";
import { TeacherToolbox } from "@/components/teacher/TeacherToolbox";

const Classes = () => {
  const { 
    classrooms, 
    loading, 
    userRole, 
    selectedClassroom, 
    setSelectedClassroom,
    handleClassroomCreated,
    handleDeleteClassroom
  } = useClassroomManagement();
  
  const { toast } = useToast();

  useEffect(() => {
    // Log information to help debugging
    console.log("Classes page loaded", { userRole, loading, classroomsCount: classrooms?.length });
  }, [userRole, loading, classrooms]);

  if (loading) {
    return <ClassesLoading />;
  }

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

      {userRole === 'teacher' && (
        <motion.div variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}>
          <TeacherToolbox />
        </motion.div>
      )}

      {userRole === 'student' && classrooms.length === 0 && (
        <motion.div variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}>
          <JoinClassSection />
        </motion.div>
      )}
      
      {selectedClassroom && userRole === 'teacher' && (
        <motion.div variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Invite Students to {selectedClassroom.name}</h2>
            <InviteStudents classroomId={selectedClassroom.id} />
          </div>
        </motion.div>
      )}

      <ClassroomsList 
        classrooms={classrooms} 
        userRole={userRole} 
        onDelete={handleDeleteClassroom}
        onSelect={setSelectedClassroom}
        selectedClassroom={selectedClassroom}
      />
      
      {/* Decorative elements */}
      <div className="hidden md:block">
        <div className="hexagon absolute top-40 right-40 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
        <div className="hexagon absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
      </div>
    </motion.div>
  );
};

export default Classes;
