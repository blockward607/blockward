
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Mock data for demo
const demoClassrooms = [
  {
    id: "demo-class-1",
    name: "Mathematics 101",
    description: "Introductory mathematics class covering algebra and geometry",
    teacher_id: "demo-teacher",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    students_count: 24
  },
  {
    id: "demo-class-2",
    name: "Science Lab",
    description: "Hands-on science experiments and theory",
    teacher_id: "demo-teacher",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    students_count: 18
  }
];

const ViewTeacherDashboard = () => {
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold gradient-text">Teacher Demo Mode</h2>
          <p className="text-gray-300">
            You're viewing the teacher dashboard demo. Sign up for a full account to create your own classrooms!
          </p>
        </div>
      </motion.div>

      <DashboardHeader
        title="Teacher Dashboard Demo"
        subtitle="Explore the teacher features of Blockward"
      />
      
      <TeacherDashboard 
        classrooms={demoClassrooms}
        selectedClassroom={selectedClassroom}
      />
    </div>
  );
};

export default ViewTeacherDashboard;
