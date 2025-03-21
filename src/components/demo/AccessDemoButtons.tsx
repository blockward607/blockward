
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GraduationCap, School, ArrowRight, PlayCircle, Monitor, Sparkles, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const AccessDemoButtons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleStudentDemo = () => {
    toast({
      title: "Student Preview",
      description: "Loading student demo experience..."
    });
    navigate('/view-student-dashboard');
  };

  const handleTeacherDemo = () => {
    toast({
      title: "Teacher Preview",
      description: "Loading teacher demo experience..."
    });
    navigate('/view-teacher-dashboard');
  };

  const handleSignUp = () => {
    toast({
      title: "Free Trial",
      description: "Taking you to the sign up page..."
    });
    navigate('/auth');
  };

  const handlePreview = (type: 'student' | 'teacher') => {
    toast({
      title: `${type === 'student' ? 'Student' : 'Teacher'} Preview`,
      description: `Quick preview of the ${type} interface initiated!`
    });
    
    // Set a small delay for the toast to show before navigation
    setTimeout(() => {
      navigate(type === 'student' ? '/view-student-dashboard' : '/view-teacher-dashboard');
    }, 400);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-8"
    >
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-xl"
        onHoverStart={() => setHoveredButton('student')}
        onHoverEnd={() => setHoveredButton(null)}
      >
        <Button
          onClick={handleStudentDemo}
          className="w-full py-8 h-auto bg-gradient-to-r from-indigo-600/90 to-purple-700/90 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_10px_25px_-5px_rgba(155,135,245,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(155,135,245,0.8)] transition-all duration-300 rounded-xl border border-purple-500/30 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="flex flex-col items-center justify-center gap-2 font-medium text-lg z-10 relative">
            <Monitor className="w-8 h-8 mb-1 text-purple-300" />
            <span className="text-xl font-bold">Student Preview</span>
            <span className="text-sm text-purple-200 font-normal">View student interface</span>
          </div>
        </Button>
        
        {hoveredButton === 'student' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-3 right-3 z-20"
          >
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview('student');
              }}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-full"
            >
              <Eye className="mr-1 h-3 w-3" />
              Quick View
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-xl"
        onHoverStart={() => setHoveredButton('teacher')}
        onHoverEnd={() => setHoveredButton(null)}
      >
        <Button
          onClick={handleTeacherDemo}
          className="w-full py-8 h-auto bg-gradient-to-r from-blue-600/90 to-indigo-700/90 hover:from-blue-600 hover:to-indigo-700 text-white shadow-[0_10px_25px_-5px_rgba(129,140,248,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(129,140,248,0.8)] transition-all duration-300 rounded-xl border border-indigo-500/30 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="flex flex-col items-center justify-center gap-2 font-medium text-lg z-10 relative">
            <Monitor className="w-8 h-8 mb-1 text-blue-300" />
            <span className="text-xl font-bold">Teacher Preview</span>
            <span className="text-sm text-blue-200 font-normal">View teacher interface</span>
          </div>
        </Button>
        
        {hoveredButton === 'teacher' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-3 right-3 z-20"
          >
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview('teacher');
              }}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-full"
            >
              <Eye className="mr-1 h-3 w-3" />
              Quick View
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-xl"
      >
        <Button
          onClick={handleSignUp}
          className="w-full py-8 h-auto bg-gradient-to-r from-green-600/90 to-emerald-700/90 hover:from-green-600 hover:to-emerald-700 text-white shadow-[0_10px_25px_-5px_rgba(52,211,153,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(52,211,153,0.8)] transition-all duration-300 rounded-xl border border-emerald-500/30 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <div className="flex flex-col items-center justify-center gap-2 font-medium text-lg z-10 relative">
            <Sparkles className="w-8 h-8 mb-1 text-green-300" />
            <span className="text-xl font-bold">Start Free Trial</span>
            <span className="text-sm text-green-200 font-normal">No credit card required</span>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
};
