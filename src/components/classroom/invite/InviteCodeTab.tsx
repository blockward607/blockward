
import { useState, useEffect } from "react";
import { useInviteCode } from "./useInviteCode";
import { InviteCodeInput } from "./InviteCodeInput";
import { EmailShareButton } from "./EmailShareButton";
import { QRCodeSection } from "./QRCodeSection";
import { GenerateCodeButton } from "./GenerateCodeButton";
import { useClassroomDetails } from "./useClassroomDetails";

interface InviteCodeTabProps {
  classroomId: string;
}

export const InviteCodeTab = ({ classroomId }: InviteCodeTabProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { loading, invitationCode, generateInviteCode, joinUrl } = useInviteCode(classroomId);
  const { teacher, classroom } = useClassroomDetails(classroomId);
  
  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  // Auto-generate code if none exists
  useEffect(() => {
    if (!invitationCode && !loading && classroomId) {
      generateInviteCode();
    }
  }, [invitationCode, loading, classroomId]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Share this invitation code with students to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <InviteCodeInput invitationCode={invitationCode} />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <EmailShareButton 
              invitationCode={invitationCode}
              classroomName={classroom?.name || "classroom"}
              teacherName={teacher?.full_name || "your teacher"}
            />
            
            <QRCodeSection 
              showQRCode={showQRCode}
              toggleQRCode={toggleQRCode}
              joinUrl={joinUrl}
              classroomName={classroom?.name || "classroom"}
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
