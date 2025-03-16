
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailInviteTab } from "./invite/EmailInviteTab";
import { InviteCodeTab } from "./invite/InviteCodeTab";
import { useClassroomDetails } from "./invite/useClassroomDetails";

interface InviteStudentsProps {
  classroomId: string;
}

export const InviteStudents = ({ classroomId }: InviteStudentsProps) => {
  const { teacherName, classroomName } = useClassroomDetails(classroomId);
  
  return (
    <Card className="p-4 bg-purple-900/30 backdrop-blur-md border border-purple-500/30 shadow-lg">
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-purple-950/50">
          <TabsTrigger value="code" className="data-[state=active]:bg-purple-700/40">Invite Code</TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-purple-700/40">Email Invite</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code">
          <InviteCodeTab 
            classroomId={classroomId}
            teacherName={teacherName}
            classroomName={classroomName}
          />
        </TabsContent>
        
        <TabsContent value="email">
          <EmailInviteTab 
            classroomId={classroomId}
            teacherName={teacherName}
            classroomName={classroomName}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
