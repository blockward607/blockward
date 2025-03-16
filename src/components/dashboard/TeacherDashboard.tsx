
import { Card } from "@/components/ui/card";
import { ClassroomList } from "./ClassroomList";
import { TeacherToolbox } from "@/components/teacher/TeacherToolbox";
import type { Classroom } from "@/types/classroom";

interface TeacherDashboardProps {
  classrooms: Partial<Classroom>[];
  selectedClassroom: string | null;
}

export const TeacherDashboard = ({ classrooms, selectedClassroom }: TeacherDashboardProps) => {
  return (
    <div className="space-y-6">
      <TeacherToolbox />
      <ClassroomList classrooms={classrooms} />
    </div>
  );
};
