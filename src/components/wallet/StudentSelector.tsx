
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/hooks/useTransferData";
import { User } from "lucide-react";

interface StudentSelectorProps {
  students: Student[];
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  loading: boolean;
  disabled: boolean;
}

export const StudentSelector = ({
  students,
  selectedStudent,
  setSelectedStudent,
  loading,
  disabled
}: StudentSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="nft-student" className="flex items-center gap-2">
        <User className="h-4 w-4 text-purple-400" />
        <span>Select Student</span>
      </Label>
      <Select 
        value={selectedStudent} 
        onValueChange={setSelectedStudent}
        disabled={loading || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {students.length === 0 ? (
            <SelectItem value="no-students" disabled>
              {loading ? "Loading students..." : "No students available"}
            </SelectItem>
          ) : (
            students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
