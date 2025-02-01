import { AttendanceStatusSelect, AttendanceStatus } from "./AttendanceStatus";

interface Student {
  id: string;
  name: string;
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
      <div className="text-center py-8 text-gray-500">
        No students found in this classroom
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div
          key={student.id}
          className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
              {student.name.charAt(0)}
            </div>
            <span>{student.name}</span>
          </div>
          {isTeacher ? (
            <AttendanceStatusSelect
              value={student.status || 'present'}
              onChange={(status) => updateStudentStatus(student.id, status)}
            />
          ) : (
            <div className="px-4 py-2 rounded-md bg-accent/20">
              {student.status || 'present'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};