
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/hooks/use-student-management";
import { StudentSelectItem } from "./StudentSelectItem";

interface StudentSelectProps {
  selectedStudentId: string;
  onStudentSelect: (studentId: string) => void;
  students?: Student[];
  placeholder?: string;
}

export const StudentSelect = ({ 
  selectedStudentId, 
  onStudentSelect,
  students: providedStudents,
  placeholder = "Select student" 
}: StudentSelectProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    // Only use provided students, no demo students
    if (providedStudents && providedStudents.length > 0) {
      setStudents(providedStudents);
    } else {
      setStudents([]);
    }
  }, [providedStudents]);

  return (
    <Select value={selectedStudentId} onValueChange={onStudentSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-sm border-purple-500/30">
        {students.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No students available. Add students first.
          </div>
        ) : (
          students.map((student) => (
            <StudentSelectItem 
              key={student.id} 
              student={student}
            />
          ))
        )}
      </SelectContent>
    </Select>
  );
};
