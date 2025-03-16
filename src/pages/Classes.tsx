
import { useState, useEffect } from "react";
import { ClassesPageHeader } from "@/components/classroom/ClassesPageHeader";
import { ClassroomsList } from "@/components/classroom/ClassroomsList";
import { ClassesLoading } from "@/components/classroom/ClassesLoading";
import { CreateClassroomDialog } from "@/components/classroom/CreateClassroomDialog";
import { EmptyClassState } from "@/components/classroom/EmptyClassState";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { useClassroomManagement } from "@/hooks/use-classroom-management";
import { useAuth } from "@/hooks/use-auth";

const Classes = () => {
  const { 
    classrooms, 
    loading, 
    userRole,
    handleClassroomCreated, 
    handleDeleteClassroom 
  } = useClassroomManagement();
  const { isTeacher, isStudent } = useAuth();
  const [showJoinSection, setShowJoinSection] = useState(false);

  // This would toggle the join class section visibility for students
  const handleToggleJoinSection = () => {
    setShowJoinSection(!showJoinSection);
  };

  if (loading) {
    return <ClassesLoading />;
  }

  return (
    <div className="container mx-auto space-y-8 max-w-6xl">
      <ClassesPageHeader />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {classrooms.length > 0 ? (
            <ClassroomsList 
              classrooms={classrooms} 
              onDeleteClassroom={handleDeleteClassroom}
            />
          ) : (
            <EmptyClassState isTeacher={isTeacher} />
          )}
        </div>
        
        <div className="w-full lg:w-80">
          {isTeacher ? (
            <CreateClassroomDialog onClassroomCreated={handleClassroomCreated} />
          ) : (
            <JoinClassSection 
              visible={true} 
              onToggleVisibility={handleToggleJoinSection} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Classes;
