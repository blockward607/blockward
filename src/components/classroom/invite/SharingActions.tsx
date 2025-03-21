
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, QrCode, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeDisplay } from "../QRCodeDisplay";

interface SharingActionsProps {
  invitationCode: string;
  getJoinUrl: () => string;
  onGenerateNew: () => void;
  teacherName?: string;
  classroomName?: string;
}

export const SharingActions = ({ 
  invitationCode, 
  getJoinUrl, 
  onGenerateNew, 
  teacherName = "Your Teacher", 
  classroomName = "the class" 
}: SharingActionsProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  const shareViaGmail = () => {
    const subject = encodeURIComponent(`Join my ${classroomName} class on Blockward`);
    const joinUrl = getJoinUrl();
    const body = encodeURIComponent(`Hello,

I'd like to invite you to join my class ${classroomName} on Blockward. 

Click this link to join directly: ${joinUrl}

Or you can manually enter this code after logging in: ${invitationCode}

Best regards,
${teacherName}`);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Gmail Opened",
      description: "Compose window opened with invitation link"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={shareViaGmail}
          className="bg-purple-600 hover:bg-purple-700 w-full"
          variant="default"
        >
          <Mail className="w-4 h-4 mr-2" />
          Share via Email
        </Button>
        <Button
          onClick={toggleQRCode}
          className={`${showQRCode ? 'bg-purple-800' : 'bg-purple-600/50'} hover:bg-purple-700 w-full`}
          variant="outline"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </Button>
        <Button
          onClick={onGenerateNew}
          className="bg-purple-600/50 hover:bg-purple-600 w-full"
          variant="outline"
        >
          <Link2 className="w-4 h-4 mr-2" />
          New Link
        </Button>
      </div>
      
      {showQRCode && (
        <QRCodeDisplay 
          value={getJoinUrl()}
          title={`Join ${classroomName}`}
          className="mt-4"
        />
      )}
    </div>
  );
};
