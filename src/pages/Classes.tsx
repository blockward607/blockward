
import { useEffect } from "react";
import { motion } from "framer-motion";
import { InviteStudents } from "@/components/classroom/InviteStudents";
import { JoinClassSection } from "@/components/classroom/join/JoinClassSection";
import { ClassesPageHeader } from "@/components/classroom/ClassesPageHeader";
import { ClassroomsList } from "@/components/classroom/ClassroomsList";
import { ClassesLoading } from "@/components/classroom/ClassesLoading";
import { useClassroomManagement } from "@/hooks/use-classroom-management";
import { EmptyClassState } from "@/components/classroom/EmptyClassState";
import { JoinClassProvider } from "@/components/classroom/join/JoinClassContext";
import { toast } from "sonner";

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

  useEffect(() => {
    console.log("Classes page loaded", { userRole, loading, classroomsCount: classrooms?.length });
    // Force refresh classrooms data when visiting the Classes page
    refreshClassrooms();
    toast.success("Classes page loaded successfully");
  }, [refreshClassrooms]);

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
    <JoinClassProvider>
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
    </JoinClassProvider>
  );
};

export default Classes;
