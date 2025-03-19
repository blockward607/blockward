
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailInviteTab } from "./EmailInviteTab";
import { InviteCodeTab } from "./InviteCodeTab";
import { useAuth } from "@/hooks/use-auth";

interface ClassroomInviteProps {
  classroomId: string;
}

export const ClassroomInvite = ({ classroomId }: ClassroomInviteProps) => {
  const [activeTab, setActiveTab] = useState<string>("code");
  const { user } = useAuth();

  if (!classroomId) {
    return <div>Classroom ID is required</div>;
  }

  return (
    <div className="w-full rounded-lg border border-purple-500/20 bg-black/40 p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="code" className="rounded-lg">
            Invitation Code
          </TabsTrigger>
          <TabsTrigger value="email" className="rounded-lg">
            Email Invites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="mt-0">
          <InviteCodeTab 
            classroomId={classroomId} 
          />
        </TabsContent>
        
        <TabsContent value="email" className="mt-0">
          <EmailInviteTab 
            classroomId={classroomId} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
