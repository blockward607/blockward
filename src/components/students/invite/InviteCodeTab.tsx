
import { useState } from "react";
import { Link2, Loader2, Copy, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const InviteCodeTab = () => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Get user session and teacher profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to generate codes"
        });
        return;
      }

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id, full_name')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Teacher profile not found"
        });
        return;
      }

      // Get the first classroom of the teacher
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', teacherProfile.id)
        .limit(1);

      if (!classrooms || classrooms.length === 0) {
        toast({
          variant: "destructive",
          title: "No Classroom",
          description: "Please create a classroom first before generating an invite code"
        });
        return;
      }

      const className = classrooms[0].name;
      const teacherName = teacherProfile.full_name || session.user.user_metadata?.name || 'Your Teacher';

      // Create invitation in database
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classrooms[0].id,
          email: 'general_invitation@blockward.app',
          status: 'pending'
        })
        .select()
        .single();
      
      if (inviteError || !invitation) {
        throw new Error(inviteError?.message || 'Failed to generate invitation');
      }
      
      setInvitationCode(invitation.invitation_token);
      toast({
        title: "Code Generated",
        description: "Invitation code generated successfully"
      });
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate invitation code"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard"
    });
  };

  const shareViaGmail = () => {
    const subject = encodeURIComponent("Join my Blockward class");
    const body = encodeURIComponent(`Hello,

I'd like to invite you to join my class on Blockward. 

Use this invitation code to join: ${invitationCode}

You can enter this code after logging in to Blockward.

Best regards,
Your Teacher`);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Gmail Opened",
      description: "Compose window opened with invitation code"
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm text-gray-300 mb-2">
        Generate an invitation code that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={invitationCode} 
              readOnly 
              className="font-mono bg-black/60 border-purple-500/30 text-white"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyToClipboard}
              className="bg-purple-700/20 border-purple-500/30 hover:bg-purple-700/40"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={shareViaGmail}
              className="bg-purple-700 hover:bg-purple-800 w-full"
              variant="default"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Gmail
            </Button>
            <Button
              onClick={generateInviteCode}
              className="bg-purple-700/50 hover:bg-purple-700 w-full"
              variant="outline"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Generate New Code
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            This code expires in 7 days. Share it with your students.
          </p>
        </div>
      ) : (
        <Button 
          onClick={generateInviteCode} 
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-800 py-6 text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              Generate Invitation Code
            </>
          )}
        </Button>
      )}
    </div>
  );
};
