
import React, { useEffect, useState } from "react";
import { useClassroomStudents } from "@/hooks/use-classroom-students";
import { Seat, Student } from "./types";
import { Card } from "@/components/ui/card";

interface DraggableSeatingChartProps {
  classroomId: string;
  shuffleFlag: number;
}

function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const DraggableSeatingChart = ({
  classroomId,
  shuffleFlag,
}: DraggableSeatingChartProps) => {
  const { students, loading } = useClassroomStudents(classroomId);
  const [seats, setSeats] = useState<(Student | null)[]>(
    Array(18).fill(null)
  );
  const [draggedStudentIndex, setDraggedStudentIndex] = useState<number | null>(
    null
  );

  // On data load or shuffleFlag update, assign students seat order
  useEffect(() => {
    if (students.length === 0) return;
    let arranged = shuffleFlag > 0 ? shuffleArray(students) : [...students];
    setSeats((prev) => {
      const fresh = Array(prev.length).fill(null);
      arranged.forEach((s, idx) => {
        if (idx < fresh.length) fresh[idx] = s;
      });
      return fresh;
    });
    // eslint-disable-next-line
  }, [students, shuffleFlag]);

  // Basic drag-n-drop handlers
  const handleDragStart = (idx: number) => setDraggedStudentIndex(idx);

  const handleDrop = (toIdx: number) => {
    if (draggedStudentIndex === null) return;
    setSeats((prev) => {
      const cp = [...prev];
      [cp[toIdx], cp[draggedStudentIndex]] = [
        cp[draggedStudentIndex],
        cp[toIdx],
      ];
      return cp;
    });
    setDraggedStudentIndex(null);
  };

  return loading ? (
    <div className="py-6 flex justify-center items-center">
      Loading seating...
    </div>
  ) : (
    <div className="flex flex-wrap gap-4 justify-center items-start">
      {[...Array(3)].map((_, rowIdx) => (
        <div key={rowIdx} className="flex flex-col gap-4">
          {[...Array(6)].map((_, colIdx) => {
            const idx = rowIdx * 6 + colIdx;
            const student = seats[idx];
            return (
              <Card
                key={idx}
                className={`w-24 h-24 flex items-center justify-center border-2 border-purple-400 bg-black/60 select-none`}
                draggable={!!student}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={() => handleDrop(idx)}
              >
                {student ? (
                  <span className="font-semibold text-sm">
                    {student.name}
                  </span>
                ) : (
                  <span className="text-gray-500">Empty</span>
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};
