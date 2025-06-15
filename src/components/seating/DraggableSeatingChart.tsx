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
  highlightUserId,
}: DraggableSeatingChartProps & { highlightUserId?: string }) => {
  const { students, loading } = useClassroomStudents(classroomId);
  const [seats, setSeats] = useState<(Student | null)[]>(
    Array(18).fill(null)
  );
  const [draggedStudentIndex, setDraggedStudentIndex] = useState<number | null>(
    null
  );
  // Find the seat index for the logged in student, if applicable
  const highlightSeatIdx = highlightUserId
    ? seats.findIndex((s) => s && s.id && s.user_id === highlightUserId)
    : -1;

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

  if (loading) {
    return (
      <div className="py-6 flex justify-center items-center">
        Loading seating...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400">
        No students are enrolled in this classroom. Invite students to begin arranging your seating plan!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center items-start">
      {[...Array(3)].map((_, rowIdx) => (
        <div key={rowIdx} className="flex flex-col gap-4">
          {[...Array(6)].map((_, colIdx) => {
            const idx = rowIdx * 6 + colIdx;
            const student = seats[idx];
            const isHighlighted = idx === highlightSeatIdx;
            return (
              <Card
                key={idx}
                className={`w-24 h-24 flex items-center justify-center border-2
                  ${isHighlighted ? "border-yellow-400 bg-yellow-200/90 text-black" : "border-purple-400 bg-black/60"}
                  select-none`}
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
                {isHighlighted && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-yellow-300 px-1 py-[1px] rounded text-black font-bold shadow">You</span>
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};
