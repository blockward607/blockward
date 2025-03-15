
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ManualEntryTabProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
  onSuccess: () => void;
}

export const ManualEntryTab = ({ onAddStudent, onSuccess }: ManualEntryTabProps) => {
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a student name"
      });
      return;
    }

    try {
      setIsLoading(true);
      await onAddStudent(newStudentName, newStudentSchool);
      setNewStudentName("");
      setNewStudentSchool("");
      toast({
        title: "Success",
        description: "Student added successfully"
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Input
        placeholder="Student name"
        value={newStudentName}
        onChange={(e) => setNewStudentName(e.target.value)}
        className="bg-black border-purple-500/30 text-white"
      />
      <Input
        placeholder="School (optional)"
        value={newStudentSchool}
        onChange={(e) => setNewStudentSchool(e.target.value)}
        className="bg-black border-purple-500/30 text-white"
      />
      <Button 
        onClick={handleAddStudent} 
        disabled={isLoading}
        className="w-full bg-purple-700 hover:bg-purple-800 py-6 text-lg"
      >
        {isLoading ? "Adding..." : "Add Student"}
      </Button>
    </div>
  );
};
