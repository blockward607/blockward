
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChartBar } from "lucide-react";
import { useStudentManagement } from "@/hooks/use-student-management";
import { StudentList } from "@/components/students/StudentList";
import { StudentsHeader } from "@/components/students/StudentsHeader";
import { DeleteStudentDialog } from "@/components/students/DeleteStudentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";

const Students = () => {
  const {
    students,
    loading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    addNewStudent,
    initiateDeleteStudent,
    confirmDeleteStudent
  } = useStudentManagement();
  const [activeTab, setActiveTab] = useState("list");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="p-4 flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          <span className="text-xl gradient-text">Loading students...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 relative z-10"
    >
      <StudentsHeader onAddStudent={addNewStudent} />
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="list" className="data-[state=active]:bg-purple-600">
            <Users className="w-4 h-4 mr-2" />
            Students List
          </TabsTrigger>
          <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-600">
            <ChartBar className="w-4 h-4 mr-2" />
            Behavior
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <StudentList 
            students={students} 
            onDeleteStudent={initiateDeleteStudent} 
          />
        </TabsContent>
        
        <TabsContent value="behavior" className="mt-0">
          <BehaviorTracker />
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Dialog for Delete */}
      <DeleteStudentDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDeleteStudent}
      />
      
      {/* Decorative elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="hexagon absolute top-40 right-40 w-64 h-64 bg-gradient-to-r from-purple-700/20 to-purple-400/10"></div>
        <div className="hexagon absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-r from-purple-600/20 to-purple-300/10"></div>
      </div>
    </motion.div>
  );
};

export default Students;
