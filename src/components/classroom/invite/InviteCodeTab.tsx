
import { useState, useEffect } from "react";
import { useInviteCode } from "./useInviteCode";
import { InviteCodeInput } from "./InviteCodeInput";
import { QRCodeSection } from "./QRCodeSection";
import { GenerateCodeButton } from "./GenerateCodeButton";
import { useClassroomDetails } from "./useClassroomDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Mail, QrCode, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteCodeTabProps {
  classroomId: string;
}

export const InviteCodeTab = ({ classroomId }: InviteCodeTabProps) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const { loading, invitationCode, generateInviteCode, joinUrl } = useInviteCode(classroomId);
  const { teacher, classroom } = useClassroomDetails(classroomId);
  const { toast } = useToast();
  
  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  // Auto-generate code if none exists
  useEffect(() => {
    if (!invitationCode && !loading && classroomId) {
      generateInviteCode();
    }
  }, [invitationCode, loading, classroomId, generateInviteCode]);

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join my ${classroom?.name || 'BlockWard'} class`);
    const body = encodeURIComponent(`Hello,

I'd like to invite you to join my class on BlockWard.

Use this invitation code to join: ${invitationCode}

You can enter this code after logging in to BlockWard.

Best regards,
${teacher?.full_name || 'Your Teacher'}`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast({
      title: "Email client opened",
      description: "Share the invitation code with your students",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard",
    });
  };

  if (loading && !invitationCode) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Share this invitation code with students to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <div className="relative">
            <InviteCodeInput invitationCode={invitationCode} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={shareViaEmail} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Email
            </Button>
            
            <Button 
              onClick={toggleQRCode} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQRCode ? "Hide QR Code" : "Show QR Code"}
            </Button>
            
            <Button 
              onClick={generateInviteCode}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              <Link2 className="w-4 h-4 mr-2" />
              New Code
            </Button>
          </div>
          
          {showQRCode && (
            <QRCodeSection 
              showQRCode={showQRCode}
              toggleQRCode={toggleQRCode}
              joinUrl={joinUrl}
              classroomName={classroom?.name || "classroom"}
            />
          )}
          
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
