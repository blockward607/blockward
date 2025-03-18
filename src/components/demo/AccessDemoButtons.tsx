
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GraduationCap, School, ArrowRight, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export const AccessDemoButtons = () => {
  const navigate = useNavigate();

  const handleStudentDemo = () => {
    navigate('/view-student-dashboard');
  };

  const handleTeacherDemo = () => {
    navigate('/view-teacher-dashboard');
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-8"
    >
      <Button
        onClick={handleStudentDemo}
        className="py-6 h-auto bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex items-center justify-center gap-2 font-medium text-lg"
      >
        <GraduationCap className="w-5 h-5 mr-1" />
        Student Preview
      </Button>
      
      <Button
        onClick={handleTeacherDemo}
        className="py-6 h-auto bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex items-center justify-center gap-2 font-medium text-lg"
      >
        <School className="w-5 h-5 mr-1" />
        Teacher Preview
      </Button>
      
      <Button
        onClick={handleSignUp}
        className="py-6 h-auto bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex items-center justify-center gap-2 font-medium text-lg"
      >
        Start Free Trial
        <ArrowRight className="w-5 h-5 ml-1" />
      </Button>
    </motion.div>
  );
};
