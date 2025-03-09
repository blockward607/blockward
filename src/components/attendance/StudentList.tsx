
import { AttendanceStatusSelect, AttendanceStatus } from "./AttendanceStatus";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <X className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium">No students found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          There are no students enrolled in this classroom. Students need to be added to the classroom before attendance can be taken.
        </p>
      </div>
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
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{statusValue}</Badge>;
      case 'absent':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">{statusValue}</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{statusValue}</Badge>;
      default:
        return <Badge variant="outline">{statusValue}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-1 divide-y">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {student.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{student.name}</span>
                  {student.email && (
                    <span className="text-xs text-muted-foreground">{student.email}</span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
