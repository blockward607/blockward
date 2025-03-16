
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  user_id: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  points_possible: number;
  classroom_id: string;
}

interface AssignGradeFormProps {
  students: Student[];
  assignments: Assignment[];
  onClose: () => void;
  selectedStudent: string;
  setSelectedStudent: (id: string) => void;
  selectedAssignment: string;
  setSelectedAssignment: (id: string) => void;
}

export const AssignGradeForm = ({
  students,
  assignments,
  onClose,
  selectedStudent,
  setSelectedStudent,
  selectedAssignment,
  setSelectedAssignment
}: AssignGradeFormProps) => {
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedAssignmentData = assignments.find(a => a.id === selectedAssignment);
  const maxPoints = selectedAssignmentData?.points_possible || 100;

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedAssignment) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both a student and an assignment"
      });
      return;
    }

    if (pointsEarned < 0 || pointsEarned > maxPoints) {
      toast({
        variant: "destructive",
        title: "Invalid points",
        description: `Points must be between 0 and ${maxPoints}`
      });
      return;
    }

    setLoading(true);

    try {
      // Check if grade already exists
      const { data: existingGrade, error: checkError } = await supabase
        .from('grades')
        .select('id')
        .eq('student_id', selectedStudent)
        .eq('assignment_id', selectedAssignment)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingGrade) {
        // Update existing grade
        const { error: updateError } = await supabase
          .from('grades')
          .update({
            points_earned: pointsEarned,
            feedback: feedback.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGrade.id);

        if (updateError) throw updateError;
        
        toast({
          title: "Grade updated",
          description: "The student's grade has been updated successfully"
        });
      } else {
        // Insert new grade
        const { error: insertError } = await supabase
          .from('grades')
          .insert({
            student_id: selectedStudent,
            assignment_id: selectedAssignment,
            points_earned: pointsEarned,
            feedback: feedback.trim() || null
          });

        if (insertError) throw insertError;
        
        toast({
          title: "Grade assigned",
          description: "The grade has been assigned to the student"
        });
      }

      // Reset form and close
      setPointsEarned(0);
      setFeedback("");
      onClose();
    } catch (error) {
      console.error('Error assigning grade:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign grade. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-black border-purple-500/30">
      <h2 className="text-xl font-bold mb-4">Assign Grade</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Student
            </label>
            <Select 
              value={selectedStudent} 
              onValueChange={setSelectedStudent}
            >
              <SelectTrigger className="bg-black/50 border-purple-500/30">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Assignment
            </label>
            <Select 
              value={selectedAssignment} 
              onValueChange={setSelectedAssignment}
            >
              <SelectTrigger className="bg-black/50 border-purple-500/30">
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map(assignment => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title} ({assignment.points_possible} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label htmlFor="points" className="block text-sm font-medium mb-1">
            Points Earned ({selectedAssignmentData ? `out of ${selectedAssignmentData.points_possible}` : ''})
          </label>
          <Input
            id="points"
            type="number"
            min="0"
            max={maxPoints}
            value={pointsEarned}
            onChange={(e) => setPointsEarned(Number(e.target.value))}
            className="bg-black/50 border-purple-500/30"
          />
        </div>
        
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium mb-1">
            Feedback (optional)
          </label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback for the student..."
            className="bg-black/50 border-purple-500/30 min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-purple-500/30 hover:bg-purple-900/20"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !selectedStudent || !selectedAssignment}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Assign Grade
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
