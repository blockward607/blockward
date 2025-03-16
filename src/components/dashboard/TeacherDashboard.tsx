
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Award, Trophy, Wallet, BookOpen, ChartBar, Settings, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClassroomList } from "./ClassroomList";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";
import { AchievementSystem } from "@/components/achievements/AchievementSystem";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { TeacherToolbox } from "@/components/teacher/TeacherToolbox";
import type { Classroom } from "@/types/classroom";

interface TeacherDashboardProps {
  classrooms: Partial<Classroom>[];
  selectedClassroom: string | null;
}

export const TeacherDashboard = ({ classrooms, selectedClassroom }: TeacherDashboardProps) => {
  return (
    <Tabs defaultValue="classrooms" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        <TabsTrigger value="classrooms" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden md:inline">Classrooms</span>
        </TabsTrigger>
        
        <TabsTrigger value="attendance" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="hidden md:inline">Attendance</span>
        </TabsTrigger>
        
        <TabsTrigger value="behavior" className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          <span className="hidden md:inline">Behavior</span>
        </TabsTrigger>
        
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span className="hidden md:inline">Achievements</span>
        </TabsTrigger>
        
        <TabsTrigger value="wallet" className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="hidden md:inline">NFT Wallet</span>
        </TabsTrigger>
        
        <TabsTrigger value="assignments" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span className="hidden md:inline">Assignments</span>
        </TabsTrigger>
        
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <ChartBar className="w-4 h-4" />
          <span className="hidden md:inline">Analytics</span>
        </TabsTrigger>
        
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span className="hidden md:inline">Notifications</span>
        </TabsTrigger>
        
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden md:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="classrooms">
        <div className="space-y-6">
          <TeacherToolbox />
          <ClassroomList classrooms={classrooms} />
        </div>
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
        {selectedClassroom ? (
          <BehaviorTracker />
        ) : (
          <Card className="p-6">
            <p className="text-center text-gray-400">Please select or create a classroom first</p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="achievements">
        <Card className="p-6">
          <AchievementSystem />
        </Card>
      </TabsContent>

      <TabsContent value="wallet">
        <Card className="p-6 glass-card">
          <WalletPanel expanded={true} />
        </Card>
      </TabsContent>

      <TabsContent value="assignments">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Assignments</h2>
            <div className="grid gap-4">
              {selectedClassroom ? (
                <p className="text-center text-gray-400">No assignments yet. Create your first assignment!</p>
              ) : (
                <p className="text-center text-gray-400">Please select or create a classroom first</p>
              )}
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            {selectedClassroom ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Attendance Rate</h3>
                  <p className="text-2xl font-bold text-purple-400">95%</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Average Points</h3>
                  <p className="text-2xl font-bold text-purple-400">78</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Active Students</h3>
                  <p className="text-2xl font-bold text-purple-400">24</p>
                </Card>
              </div>
            ) : (
              <p className="text-center text-gray-400">Please select or create a classroom first</p>
            )}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <div className="divide-y divide-gray-700">
              <div className="py-4">
                <p className="font-semibold">New Student Joined</p>
                <p className="text-sm text-gray-400">John Doe joined Mathematics 101</p>
              </div>
              <div className="py-4">
                <p className="font-semibold">Assignment Due Soon</p>
                <p className="text-sm text-gray-400">Algebra Homework due in 2 days</p>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
                <p className="text-sm text-gray-400">Configure how you receive notifications</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                <p className="text-sm text-gray-400">Manage your account and profile information</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Privacy Settings</h3>
                <p className="text-sm text-gray-400">Control your privacy and data settings</p>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
