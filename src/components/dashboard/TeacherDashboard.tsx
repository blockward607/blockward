
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Award, Trophy, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClassroomList } from "./ClassroomList";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";
import { AchievementSystem } from "@/components/achievements/AchievementSystem";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import type { Classroom } from "@/types/classroom";

interface TeacherDashboardProps {
  classrooms: Partial<Classroom>[];
  selectedClassroom: string | null;
}

export const TeacherDashboard = ({ classrooms, selectedClassroom }: TeacherDashboardProps) => {
  return (
    <Tabs defaultValue="classrooms" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5 gap-4">
        <TabsTrigger value="classrooms" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Classrooms
        </TabsTrigger>
        <TabsTrigger value="attendance" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Attendance
        </TabsTrigger>
        <TabsTrigger value="behavior" className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          Behavior
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Achievements
        </TabsTrigger>
        <TabsTrigger value="wallet" className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          NFT Wallet
        </TabsTrigger>
      </TabsList>

      <TabsContent value="classrooms">
        <ClassroomList classrooms={classrooms} />
      </TabsContent>

      <TabsContent value="attendance">
        {selectedClassroom ? (
          <AttendanceTracker classroomId={selectedClassroom} />
        ) : (
          <Card className="p-6">
            <p className="text-center text-gray-400">Please select or create a classroom first</p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="behavior">
        <BehaviorTracker />
      </TabsContent>

      <TabsContent value="achievements">
        <AchievementSystem />
      </TabsContent>

      <TabsContent value="wallet">
        <Card className="p-6 glass-card">
          <WalletPanel expanded={true} />
        </Card>
      </TabsContent>
    </Tabs>
  );
};
