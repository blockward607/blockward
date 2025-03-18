
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StudentGrade } from "@/services/class-join/types";
import { Loader2 } from "lucide-react";

interface StudentGradeListProps {
  grades: StudentGrade[];
  loading: boolean;
}

export const StudentGradeList = ({ grades, loading }: StudentGradeListProps) => {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const toggleFeedback = (assignmentId: string) => {
    if (selectedAssignment === assignmentId) {
      setSelectedAssignment(null);
    } else {
      setSelectedAssignment(assignmentId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <Card className="p-6 text-center bg-black/40 border-purple-500/30">
        <p className="text-gray-400">No grades available yet</p>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-purple-500/30 overflow-hidden">
      <Table>
        <TableHeader className="bg-black/60">
          <TableRow>
            <TableHead className="text-purple-300">Assignment</TableHead>
            <TableHead className="text-purple-300 text-right">Due Date</TableHead>
            <TableHead className="text-purple-300 text-right">Score</TableHead>
            <TableHead className="text-purple-300 text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grades.map(({ assignment, grade }) => {
            const isSelected = selectedAssignment === assignment.id;
            const dueDate = assignment.due_date 
              ? new Date(assignment.due_date).toLocaleDateString() 
              : "No due date";
            
            const percentage = grade 
              ? Math.round((grade.points_earned / assignment.points_possible) * 100) 
              : null;
            
            return (
              <>
                <TableRow 
                  key={assignment.id} 
                  className={`cursor-pointer hover:bg-purple-900/20 ${isSelected ? 'bg-purple-900/10' : ''}`}
                  onClick={() => toggleFeedback(assignment.id)}
                >
                  <TableCell className="font-medium">
                    {assignment.title}
                    {isSelected && grade?.feedback && (
                      <div className="mt-2 text-sm text-gray-400">
                        <span className="block font-bold text-purple-400 mb-1">Feedback:</span>
                        {grade.feedback}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{dueDate}</TableCell>
                  <TableCell className="text-right">
                    {grade ? (
                      `${grade.points_earned} / ${assignment.points_possible}`
                    ) : (
                      <Badge variant="outline">Not graded</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {percentage !== null ? (
                      <Badge className={`${
                        percentage >= 90 ? 'bg-green-500' :
                        percentage >= 80 ? 'bg-blue-500' :
                        percentage >= 70 ? 'bg-yellow-500' :
                        percentage >= 60 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}>
                        {percentage}%
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
