
import React from 'react';
import { useSeating } from './SeatingContext';
import { Users } from 'lucide-react';

export const StudentList: React.FC = () => {
  const { students, setDraggedStudent } = useSeating();

  const startDragStudent = (e: React.DragEvent, studentId: string) => {
    e.dataTransfer.setData('text/plain', studentId);
    setDraggedStudent(studentId);
  };

  return (
    <div className="bg-purple-900/10 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Students
      </h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {students.map(student => (
          <div
            key={student.id}
            draggable
            onDragStart={(e) => startDragStudent(e, student.id)}
            className="bg-purple-700/20 p-2 rounded-md cursor-grab hover:bg-purple-700/30 transition-colors"
          >
            {student.name}
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-sm text-gray-400">No students in this class</p>
        )}
      </div>
    </div>
  );
};
