
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Link2, Loader2 } from "lucide-react";

interface InviteMiniTabProps {
  classroomId: string;
}

export const InviteMiniTab = ({ classroomId }: InviteMiniTabProps) => {
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const { toast } = useToast();
  
  // Check for existing invitation code on component mount
  useEffect(() => {
    const checkExistingCode = async () => {
      if (!classroomId) return;
      
      try {
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
          const code = data[0].invitation_token;
          setInvitationCode(code);
          // Create join link with the code
          setJoinLink(`${window.location.origin}/classes?code=${code}`);
        }
      } catch (error) {
        console.error("Error checking for existing invitation code:", error);
      }
    };
    
    checkExistingCode();
  }, [classroomId]);

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Generate a simple, readable alphanumeric code
      const invitationToken = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      if (!classroomId) {
        throw new Error("No classroom ID provided");
      }
      
      console.log("Generating new invitation code for classroom:", classroomId);
      
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
      
      if (inviteError) {
        throw new Error(inviteError.message || 'Failed to generate invitation code');
      }
      
      console.log("Invitation created successfully:", invitation);
      setInvitationCode(invitation.invitation_token);
      
      // Create a link with the invitation code
      const link = `${window.location.origin}/classes?code=${invitation.invitation_token}`;
      setJoinLink(link);
      
      toast({
        title: "Invitation Link Generated",
        description: "Share this link with your students",
      });
    } catch (error: any) {
      console.error("Error in generateInviteCode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate invitation link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinLink || invitationCode);
    toast({
      title: "Copied!",
      description: joinLink ? "Invitation link copied to clipboard" : "Invitation code copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      {invitationCode ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={joinLink || invitationCode} 
              readOnly 
              className="font-mono bg-black/50 border-purple-500/30 text-sm"
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
          
          <p className="text-xs text-gray-400">
            This join link expires in 7 days. Share it with your students.
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
