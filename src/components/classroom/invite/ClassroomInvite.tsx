
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteCodeTab } from "./InviteCodeTab";
import { EmailInviteTab } from "./EmailInviteTab";
import { Card } from "@/components/ui/card";
import { useClassroomDetails } from "./useClassroomDetails";

interface ClassroomInviteProps {
  classroomId: string;
}

export const ClassroomInvite = ({ classroomId }: ClassroomInviteProps) => {
  const [activeTab, setActiveTab] = useState("code");
  const { teacherName, classroomName } = useClassroomDetails(classroomId);

  return (
    <Card className="p-6 glass-card">
      <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code">Invitation Code</TabsTrigger>
          <TabsTrigger value="email">Email Invite</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="mt-4">
          <InviteCodeTab 
            classroomId={classroomId} 
            teacherName={teacherName} 
            classroomName={classroomName} 
          />
        </TabsContent>
        <TabsContent value="email" className="mt-4">
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
