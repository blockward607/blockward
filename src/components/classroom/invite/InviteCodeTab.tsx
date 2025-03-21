
import { useInvitationCode } from "./hooks/useInvitationCode";
import { InvitationLinkDisplay } from "./InvitationLinkDisplay";
import { SharingActions } from "./SharingActions";
import { GenerateInviteButton } from "./GenerateInviteButton";

interface InviteCodeTabProps {
  classroomId: string;
  teacherName?: string;
  classroomName?: string;
}

export const InviteCodeTab = ({ 
  classroomId, 
  teacherName = "Your Teacher", 
  classroomName = "the class" 
}: InviteCodeTabProps) => {
  const { loading, invitationCode, generateInviteCode, getJoinUrl } = useInvitationCode({ 
    classroomId 
  });

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate an invitation link that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <InvitationLinkDisplay 
            invitationCode={invitationCode} 
            getJoinUrl={getJoinUrl} 
          />
          
          <SharingActions 
            invitationCode={invitationCode}
            getJoinUrl={getJoinUrl}
            onGenerateNew={generateInviteCode}
            teacherName={teacherName}
            classroomName={classroomName}
          />
        </div>
      ) : (
        <GenerateInviteButton 
          loading={loading} 
          onClick={generateInviteCode} 
        />
      )}
    </div>
  );
};
