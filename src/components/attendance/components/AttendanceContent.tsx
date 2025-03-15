
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentList } from "@/components/attendance/StudentList";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { Loader2 } from "lucide-react";
import { AttendanceStatus } from "../AttendanceStatus";

interface AttendanceContentProps {
  students: {
    id: string;
    name: string;
    status?: AttendanceStatus;
  }[];
  loading: boolean;
  isTeacher: boolean;
  updateStudentStatus: (studentId: string, status: AttendanceStatus) => void;
}

export const AttendanceContent = ({ 
  students, 
  loading, 
  isTeacher, 
  updateStudentStatus 
}: AttendanceContentProps) => {
  return (
    <Tabs defaultValue="attendance" className="space-y-4">
      <TabsList className="bg-purple-900/20 border border-purple-500/20">
        <TabsTrigger value="attendance" className="data-[state=active]:bg-purple-600">Attendance</TabsTrigger>
        <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">Statistics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="attendance" className="space-y-4 animate-fade-in">
        <StudentList 
          students={students} 
          updateStudentStatus={updateStudentStatus}
          isTeacher={isTeacher}
        />
        
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="stats" className="animate-fade-in">
        <AttendanceStats students={students} />
      </TabsContent>
    </Tabs>
  );
};
