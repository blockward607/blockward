
import { AttendanceStatusSelect, AttendanceStatus } from "./AttendanceStatus";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Student {
  id: string;
  name: string;
  email?: string;
  status?: AttendanceStatus;
}

interface StudentListProps {
  students: Student[];
  updateStudentStatus: (studentId: string, status: AttendanceStatus) => void;
  isTeacher?: boolean;
}

export const StudentList = ({ students, updateStudentStatus, isTeacher = false }: StudentListProps) => {
  if (students.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center glass-card rounded-lg"
      >
        <div className="rounded-full bg-purple-900/20 p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-purple-400" />
        </div>
        <h3 className="text-lg font-medium text-white">No students found</h3>
        <p className="text-sm text-gray-300 mt-1 max-w-md">
          There are no students enrolled in this classroom. Students need to be added to the classroom before attendance can be taken.
        </p>
      </motion.div>
    );
  }

  const getStatusIcon = (status: AttendanceStatus | undefined) => {
    const statusValue = status || 'present';
    switch (statusValue) {
      case 'present':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Check className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus | undefined) => {
    const statusValue = status || 'present';
    
    switch (statusValue) {
      case 'present':
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">{statusValue}</Badge>;
      case 'absent':
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">{statusValue}</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{statusValue}</Badge>;
      default:
        return <Badge variant="outline">{statusValue}</Badge>;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-4"
    >
      <div className="rounded-md border border-purple-500/30 overflow-hidden glass-card shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
        <div className="grid grid-cols-1 divide-y divide-purple-500/20">
          {students.map((student) => (
            <motion.div
              key={student.id}
              variants={itemVariants}
              className="flex items-center justify-between p-4 hover:bg-purple-900/30 transition-colors"
              whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.2)" }}
            >
              <div className="flex items-center gap-4">
                <Avatar className="border-2 border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                  <AvatarFallback className="bg-purple-800/50 text-purple-100">
                    {student.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{student.name}</span>
                  {student.email && (
                    <span className="text-xs text-gray-400">{student.email}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isTeacher && (
                  <div className="flex items-center gap-2 mr-2">
                    {getStatusIcon(student.status)}
                    {getStatusBadge(student.status)}
                  </div>
                )}
                
                {isTeacher && (
                  <AttendanceStatusSelect
                    value={student.status || 'present'}
                    onChange={(status) => updateStudentStatus(student.id, status)}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
