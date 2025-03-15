
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ManualEntryTabProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
  onSuccess: () => void;
}

export const ManualEntryTab = ({ onAddStudent, onSuccess }: ManualEntryTabProps) => {
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");

  const handleAddStudent = async () => {
    await onAddStudent(newStudentName, newStudentSchool);
    setNewStudentName("");
    setNewStudentSchool("");
    onSuccess();
  };

  return (
    <div className="space-y-4 mt-4">
      <Input
        placeholder="Student name"
        value={newStudentName}
        onChange={(e) => setNewStudentName(e.target.value)}
        className="bg-navy-800/80 border-purple-500/30 text-white"
      />
      <Input
        placeholder="School (optional)"
        value={newStudentSchool}
        onChange={(e) => setNewStudentSchool(e.target.value)}
        className="bg-navy-800/80 border-purple-500/30 text-white"
      />
      <Button 
        onClick={handleAddStudent} 
        className="w-full bg-purple-700 hover:bg-purple-800 py-6 text-lg"
      >
        Add Student
      </Button>
    </div>
  );
};
