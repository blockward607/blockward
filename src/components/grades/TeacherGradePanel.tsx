
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Assignment } from "@/services/class-join/types";
import { Plus, PenSquare, Loader2 } from "lucide-react";
import { CreateAssignmentDialog } from "./CreateAssignmentDialog";
import { useClassroomStudents } from "@/hooks/use-classroom-students";
import { useGrades } from "@/hooks/use-grades";

interface TeacherGradePanelProps {
  classroomId: string;
}

export const TeacherGradePanel = ({ classroomId }: TeacherGradePanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [points, setPoints] = useState<Record<string, string>>({});
  
  const { students, loading: loadingStudents } = useClassroomStudents(classroomId);
  const { assignments, loadingAssignments, submitGrade, createAssignment } = useGrades(undefined, classroomId);

  const handleAssignmentSelect = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsGrading(true);
    // Reset points and feedback
    setPoints({});
    setFeedback({});
  };

  const handleSubmitGrades = async () => {
    if (!selectedAssignment) return;
    
    // Submit grades for each student
    const promises = students.map(async (student) => {
      if (!points[student.id]) return;
      
      const pointsValue = parseFloat(points[student.id]);
      if (isNaN(pointsValue)) return;
      
      await submitGrade({
        student_id: student.id,
        assignment_id: selectedAssignment.id,
        points_earned: pointsValue,
        feedback: feedback[student.id] || ''
      });
    });
    
    await Promise.all(promises);
    setIsGrading(false);
    setSelectedAssignment(null);
  };

  const handleCreateAssignment = async (assignmentData: Partial<Assignment>) => {
    await createAssignment({
      ...assignmentData,
      classroom_id: classroomId
    });
    setIsDialogOpen(false);
  };

  if (loadingStudents || loadingAssignments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isGrading && selectedAssignment ? (
        <Card className="p-6 bg-black/40 border-purple-500/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Grading: {selectedAssignment.title}
            </h2>
            <Button onClick={() => setIsGrading(false)} variant="outline">
              Cancel
            </Button>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-400">
              Total points possible: {selectedAssignment.points_possible}
            </p>
            
            {students.length === 0 ? (
              <p className="text-center text-gray-400 my-6">No students in this class</p>
            ) : (
              <Table>
                <TableHeader className="bg-black/60">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={points[student.id] || ''}
                          onChange={(e) => setPoints({
                            ...points,
                            [student.id]: e.target.value
                          })}
                          placeholder={`Out of ${selectedAssignment.points_possible}`}
                          className="w-24 bg-black/30"
                          min={0}
                          max={selectedAssignment.points_possible}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={feedback[student.id] || ''}
                          onChange={(e) => setFeedback({
                            ...feedback,
                            [student.id]: e.target.value
                          })}
                          placeholder="Optional feedback"
                          className="h-20 bg-black/30"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitGrades}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Submit Grades
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assignments</h2>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
          
          {assignments.length === 0 ? (
            <Card className="p-6 text-center bg-black/40 border-purple-500/30">
              <p className="text-gray-400">No assignments created yet</p>
            </Card>
          ) : (
            <Card className="bg-black/40 border-purple-500/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-black/60">
                  <TableRow>
                    <TableHead className="text-purple-300">Assignment</TableHead>
                    <TableHead className="text-purple-300">Due Date</TableHead>
                    <TableHead className="text-purple-300 text-right">Points</TableHead>
                    <TableHead className="text-purple-300 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.title}
                        {assignment.description && (
                          <p className="text-sm text-gray-400 mt-1">{assignment.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.due_date 
                          ? new Date(assignment.due_date).toLocaleDateString() 
                          : "No due date"}
                      </TableCell>
                      <TableCell className="text-right">{assignment.points_possible}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignmentSelect(assignment)}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                        >
                          <PenSquare className="h-4 w-4 mr-1" />
                          Grade
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
      
      <CreateAssignmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateAssignment}
      />
    </div>
  );
};
