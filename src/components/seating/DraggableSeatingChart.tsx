
import React, { useEffect, useState } from "react";
import { useClassroomStudents } from "@/hooks/use-classroom-students";
import { Seat, Student } from "./types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DraggableSeatingChartProps {
  classroomId: string;
  shuffleFlag: number;
  highlightUserId?: string;
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
}: DraggableSeatingChartProps) => {
  const { students, loading } = useClassroomStudents(classroomId);
  const [seats, setSeats] = useState<(Student | null)[]>(Array(18).fill(null));
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);

  // Assign students to seats (on shuffle or changes)
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

  // Find the seat index for "you"
  const highlightSeatIdx = highlightUserId
    ? seats.findIndex((s) => s && s.id === highlightUserId)
    : -1;

  // Drag-and-drop handlers for students
  const handleDragStart = (student: Student) => {
    setDraggedStudent(student);
  };
  const handleDropOnSeat = (seatIdx: number) => {
    if (!draggedStudent) return;
    setSeats((prev) => {
      // Remove student from previous seat
      let arr = prev.map((s) => (s && s.id === draggedStudent.id ? null : s));
      // Place in the dropped seat (replace if another student is there)
      arr[seatIdx] = draggedStudent;
      return arr;
    });
    setDraggedStudent(null);
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

  // Roster of all students (draggable avatars)
  const roster = (
    <div className="flex flex-wrap gap-3 mb-4">
      {students.map((student) => {
        const alreadySeated = seats.some((seatStu) => seatStu && seatStu.id === student.id);
        return (
          <div
            key={student.id}
            draggable={!alreadySeated}
            onDragStart={() => handleDragStart(student)}
            className={`flex flex-col items-center cursor-${alreadySeated ? "not-allowed" : "grab"} mx-1`}
            style={{
              opacity: alreadySeated ? 0.5 : 1,
              pointerEvents: alreadySeated ? "none" : "auto",
            }}
          >
            <Avatar className={`border-2 ${alreadySeated ? "border-gray-400" : "border-purple-500/50"}`}>
              <AvatarFallback>{student.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-white">{student.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {roster}
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
                  className={`w-24 h-24 flex flex-col items-center justify-center border-2 group relative
                    ${isHighlighted ? "border-yellow-400 bg-yellow-200/90 text-black" : "border-purple-400 bg-black/60"}
                    select-none`}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={() => handleDropOnSeat(idx)}
                >
                  {student ? (
                    <>
                      <Avatar>
                        <AvatarFallback>{student.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-xs mt-1">{student.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSeats((prev) =>
                            prev.map((s, i) => (i === idx ? null : s))
                          )
                        }
                        className="absolute right-1 top-1 text-xs bg-red-600 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition"
                        title="Remove student from seat"
                      >
                        ×
                      </button>
                    </>
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
    </div>
  );
};
