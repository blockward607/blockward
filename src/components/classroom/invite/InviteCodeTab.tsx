
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Copy, Link2, Loader2, QrCode } from "lucide-react";
import { QRCodeDisplay } from "../QRCodeDisplay";

interface InviteCodeTabProps {
  classroomId: string;
  teacherName?: string;
  classroomName?: string;
}

export const InviteCodeTab = ({ classroomId, teacherName = "Your Teacher", classroomName = "the class" }: InviteCodeTabProps) => {
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  
  // Check for existing invitation code on component mount
  useEffect(() => {
    const checkExistingCode = async () => {
      if (!classroomId) return;
      
      try {
        console.log("[InviteCodeTab] Checking for existing invitation code for classroom:", classroomId);
        const { data, error } = await supabase
          .from('class_invitations')
          .select('invitation_token')
          .eq('classroom_id', classroomId)
          .eq('status', 'pending')
          .eq('email', 'general_invitation@blockward.app')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("[InviteCodeTab] Found existing invitation code:", data[0].invitation_token);
          setInvitationCode(data[0].invitation_token);
        } else {
          console.log("[InviteCodeTab] No existing invitation code found for this classroom");
        }
      } catch (error) {
        console.error("[InviteCodeTab] Error checking for existing invitation code:", error);
      }
    };
    
    checkExistingCode();
  }, [classroomId]);

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Generate a simple, consistent, alphanumeric code - all uppercase
      const invitationToken = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      if (!classroomId) {
        throw new Error("No classroom ID provided");
      }
      
      console.log("[InviteCodeTab] Generating new invitation code for classroom:", classroomId);
      console.log("[InviteCodeTab] Generated invitation token:", invitationToken);
      
      // Store the invitation code in Supabase
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app', // Marker for general invitations
          invitation_token: invitationToken, // Already uppercase
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .select()
        .single();
      
      if (inviteError) {
        console.error("[InviteCodeTab] Error generating invitation:", inviteError);
        throw new Error(inviteError.message || 'Failed to generate invitation code');
      }
      
      if (!invitation) {
        throw new Error("Failed to create invitation record");
      }
      
      console.log("[InviteCodeTab] Invitation created successfully:", invitation);
      setInvitationCode(invitation.invitation_token);
      toast({
        title: "Invitation Link Generated",
        description: "Share this link with your students",
      });
    } catch (error: any) {
      console.error("[InviteCodeTab] Error in generateInviteCode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Join link copied to clipboard",
    });
  };

  // Create a direct join URL that works both on desktop and mobile
  const getJoinUrl = () => {
    // Use window.location.origin to get the domain (works in both development and production)
    const baseUrl = window.location.origin;
    // Create a direct join URL with the code as a query parameter - this directs students to the auth page first
    return `${baseUrl}/auth?join=${invitationCode.trim()}`;
  };

  const shareViaGmail = () => {
    const subject = encodeURIComponent(`Join my ${classroomName} class on Blockward`);
    const joinUrl = getJoinUrl();
    const body = encodeURIComponent(`Hello,

I'd like to invite you to join my class ${classroomName} on Blockward. 

Click this link to join directly: ${joinUrl}

Best regards,
${teacherName}`);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Gmail Opened",
      description: "Compose window opened with invitation link"
    });
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate an invitation link that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400">Share this link with your students:</p>
            <div className="flex gap-2">
              <Input 
                value={getJoinUrl()} 
                readOnly 
                className="font-mono bg-black/50 border-purple-500/30 text-sm text-purple-300"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => copyToClipboard(getJoinUrl())}
                title="Copy join link"
                className="bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
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
          
          <p className="text-xs text-gray-400">
            This link expires in 7 days. Share it with your students.
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
              Generate Invitation Link
            </>
          )}
        </Button>
      )}
    </div>
  );
};
