
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface QuickAttendancePanelProps {
  students: { id: string; name: string }[];
  onAttendance: (records: { [studentId: string]: "present" | "absent" }) => void;
}

export const QuickAttendancePanel: React.FC<QuickAttendancePanelProps> = ({
  students,
  onAttendance,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<{ [studentId: string]: "present" | "absent" }>({});

  const mark = (status: "present" | "absent") => {
    const student = students[currentIdx];
    if (!student) return;
    setResults((prev) => ({ ...prev, [student.id]: status }));
    if (currentIdx < students.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const saveAttendance = () => {
    onAttendance(results);
  };

  if (students.length === 0)
    return <div className="text-gray-400 py-4">No students enrolled</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <Badge className="mr-3 px-4 py-2 text-lg shadow-lg bg-purple-800/70 border-purple-500/20">
          {currentIdx + 1} / {students.length}
        </Badge>
        <span className="text-xl font-semibold text-white">{students[currentIdx].name}</span>
      </div>
      <div className="flex justify-center gap-8 mt-5">
        <Button
          size="xl"
          className="bg-green-600 hover:bg-green-700 text-xl px-8 py-4"
          onClick={() => mark("present")}
        >
          <Check className="mr-2" /> Present (P)
        </Button>
        <Button
          size="xl"
          className="bg-red-600 hover:bg-red-700 text-xl px-8 py-4"
          onClick={() => mark("absent")}
        >
          <X className="mr-2" /> Absent (A)
        </Button>
      </div>
      <div className="flex justify-center">
        <Button
          onClick={saveAttendance}
          disabled={Object.keys(results).length !== students.length}
          className="mt-5 bg-purple-700 hover:bg-purple-800"
        >
          Save Attendance
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-6 justify-center text-xs">
        {students.map((s, idx) => {
          let v = results[s.id];
          return (
            <span
              key={s.id}
              className={`px-2 py-1 rounded ${
                v === "present"
                  ? "bg-green-500 text-white"
                  : v === "absent"
                  ? "bg-red-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {s.name.split(" ")[0]}: {v ? (v === "present" ? "P" : "A") : "_"}
            </span>
          );
        })}
      </div>
    </div>
  );
};
