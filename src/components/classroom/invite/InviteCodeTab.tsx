
import { useState } from "react";
import { useInviteCode } from "./useInviteCode";
import { InviteCodeInput } from "./InviteCodeInput";
import { EmailShareButton } from "./EmailShareButton";
import { QRCodeSection } from "./QRCodeSection";
import { GenerateCodeButton } from "./GenerateCodeButton";

interface InviteCodeTabProps {
  classroomId: string;
  teacherName: string;
  classroomName: string;
}

export const InviteCodeTab = ({ classroomId, teacherName, classroomName }: InviteCodeTabProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { loading, invitationCode, generateInviteCode, joinUrl } = useInviteCode(classroomId);
  
  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate an invitation code that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <InviteCodeInput invitationCode={invitationCode} />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <EmailShareButton 
              invitationCode={invitationCode}
              classroomName={classroomName}
              teacherName={teacherName}
            />
            
            <QRCodeSection 
              showQRCode={showQRCode}
              toggleQRCode={toggleQRCode}
              joinUrl={joinUrl}
              classroomName={classroomName}
            />
            
            <GenerateCodeButton 
              loading={loading}
              onClick={generateInviteCode}
            />
          </div>
          
          <p className="text-xs text-gray-400">
            This code expires in 7 days. Share it with your students.
          </p>
        </div>
      ) : (
        <GenerateCodeButton 
          loading={loading}
          onClick={generateInviteCode}
          variant="full"
        />
      )}
    </div>
  );
};
