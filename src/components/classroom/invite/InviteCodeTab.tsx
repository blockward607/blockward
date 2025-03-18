
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Copy, Link2, Loader2, QrCode } from "lucide-react";
import { QRCodeDisplay } from "../QRCodeDisplay";

interface InviteCodeTabProps {
  classroomId: string;
  teacherName: string;
  classroomName: string;
}

export const InviteCodeTab = ({ classroomId, teacherName, classroomName }: InviteCodeTabProps) => {
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Generate a simple, readable alphanumeric code (all uppercase for easier reading)
      const invitationToken = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      console.log("Generating invitation code:", invitationToken, "for classroom:", classroomId);
      
      // Store the invitation code in Supabase
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app', // Marker for general invitations
          invitation_token: invitationToken,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .select()
        .single();
      
      if (inviteError || !invitation) {
        console.error("Error generating invitation:", inviteError);
        throw new Error(inviteError?.message || 'Failed to generate invitation code');
      }
      
      console.log("Invitation created successfully:", invitation);
      setInvitationCode(invitation.invitation_token);
      toast({
        title: "Invitation Code Generated",
        description: "Share this code with your students",
      });
    } catch (error: any) {
      console.error("Error in generateInviteCode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard",
    });
  };

  const shareViaGmail = () => {
    const subject = encodeURIComponent(`Join my ${classroomName} class on Blockward`);
    const body = encodeURIComponent(`Hello,

I'd like to invite you to join my class ${classroomName} on Blockward. 

Use this invitation code to join: ${invitationCode}

You can enter this code after logging in to Blockward.

Best regards,
${teacherName}`);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Gmail Opened",
      description: "Compose window opened with invitation code"
    });
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  // Create a URL that will automatically apply the code when clicked
  const joinUrl = `${window.location.origin}/classes?code=${invitationCode}`;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate an invitation code that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={invitationCode} 
              readOnly 
              className="font-mono bg-black/50 border-purple-500/30 text-lg"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyToClipboard}
              title="Copy to clipboard"
              className="bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
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
              onClick={generateInviteCode}
              className="bg-purple-600/50 hover:bg-purple-600 w-full"
              variant="outline"
            >
              <Link2 className="w-4 h-4 mr-2" />
              New Code
            </Button>
          </div>
          
          {showQRCode && (
            <QRCodeDisplay 
              value={joinUrl}
              title={`Join ${classroomName}`}
              className="mt-4"
            />
          )}
          
          <p className="text-xs text-gray-400">
            This code expires in 7 days. Share it with your students.
          </p>
        </div>
      ) : (
        <Button 
          onClick={generateInviteCode} 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Generate Invitation Code
            </>
          )}
        </Button>
      )}
    </div>
  );
};
