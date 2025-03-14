
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Medal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useStudents } from "@/hooks/use-students";
import { StudentSelectItem } from "./StudentSelectItem";

interface StudentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const StudentSelect = ({ value, onChange }: StudentSelectProps) => {
  const { students, loading } = useStudents();

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading Students...
        </label>
        <Select disabled>
          <SelectTrigger className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
            <SelectValue placeholder="Loading students..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="text-sm text-gray-400 flex items-center gap-2">
        <Medal className="w-4 h-4 text-purple-400" /> Select Recipient for BlockWard
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="glass-input bg-black/20 border-purple-500/20 backdrop-blur-sm">
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent className="bg-black/80 backdrop-blur-xl border-purple-500/20">
          {students.length === 0 ? (
            <SelectItem value="none" disabled>
              No students available
            </SelectItem>
          ) : (
            students.map((student) => (
              <StudentSelectItem key={student.id} student={student} />
            ))
          )}
        </SelectContent>
      </Select>
    </motion.div>
  );
};
