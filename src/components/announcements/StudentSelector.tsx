
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserCheck } from "lucide-react";

interface Student {
  id: string;
  name: string;
  user_id: string;
}

interface StudentSelectorProps {
  selectedStudents: string[];
  onStudentsChange: (students: string[]) => void;
  classroomId?: string;
}

export const StudentSelector = ({ 
  selectedStudents, 
  onStudentsChange, 
  classroomId 
}: StudentSelectorProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // If a classroom is selected, only show students from that classroom
      if (classroomId) {
        const { data, error } = await supabase
          .from('students')
          .select(`
            id, 
            name, 
            user_id,
            classroom_students!inner(classroom_id)
          `)
          .eq('classroom_students.classroom_id', classroomId);

        if (error) throw error;
        setStudents(data || []);
      } else {
        // Show all students if no classroom is selected
        const { data, error } = await supabase
          .from('students')
          .select('id, name, user_id');

        if (error) throw error;
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (userId: string) => {
    const newSelection = selectedStudents.includes(userId)
      ? selectedStudents.filter(id => id !== userId)
      : [...selectedStudents, userId];
    onStudentsChange(newSelection);
  };

  const handleSelectAll = () => {
    const allUserIds = students.map(s => s.user_id);
    onStudentsChange(allUserIds);
  };

  const handleClearAll = () => {
    onStudentsChange([]);
  };

  if (loading) {
    return <div className="text-center py-4">Loading students...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Individual Students ({selectedStudents.length} selected)
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={students.length === 0}
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedStudents.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="p-4 text-center text-gray-400">
          {classroomId ? 'No students in this classroom' : 'No students found'}
        </Card>
      ) : (
        <Card className="p-4">
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-800/50"
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.user_id)}
                    onCheckedChange={() => handleStudentToggle(student.user_id)}
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <UserCheck className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{student.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};
