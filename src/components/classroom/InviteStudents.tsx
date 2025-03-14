
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Copy, Link2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface InviteStudentsProps {
  classroomId: string;
}

export const InviteStudents = ({ classroomId }: InviteStudentsProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Fetch classroom details
    const fetchClassroomDetails = async () => {
      try {
        // Get classroom name
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('name, teacher_id')
          .eq('id', classroomId)
          .single();
          
        if (classroom) {
          setClassroomName(classroom.name);
          
          // Get teacher name
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('full_name')
            .eq('id', classroom.teacher_id)
            .single();
            
          if (teacherProfile) {
            setTeacherName(teacherProfile.full_name || 'Your Teacher');
          }
        }
      } catch (error) {
        console.error('Error fetching classroom details:', error);
      }
    };
    
    fetchClassroomDetails();
  }, [classroomId]);

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: email.toLowerCase(),
          status: 'pending'
        })
        .select()
        .single();
      
      if (inviteError || !invitation) {
        throw new Error(inviteError?.message || 'Failed to create invitation');
      }

      // Send email using edge function
      const response = await fetch("https://vuwowvhoiyzmnjuoawqz.supabase.co/functions/v1/send-verification", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1d293dmhvaXl6bW5qdW9hd3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNjYxNTAsImV4cCI6MjA1MTg0MjE1MH0.CMCrS1XZiO91JapxorBTUBeD4AD_lSFfa1hIjM7CMeg`
        },
        body: JSON.stringify({
          email: email,
          verificationToken: invitation.invitation_token,
          teacherName: teacherName,
          className: classroomName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email invitation');
      }
      
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app',
          status: 'pending'
        })
        .select()
        .single();
      
      if (inviteError || !invitation) {
        throw new Error(inviteError?.message || 'Failed to generate invitation code');
      }
      
      setInvitationCode(invitation.invitation_token);
      
      toast({
        title: "Invitation Code Generated",
        description: "Share this code with your students",
      });
    } catch (error: any) {
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

  return (
    <Card className="p-4 bg-purple-900/30 backdrop-blur-md border border-purple-500/30 shadow-lg">
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-purple-950/50">
          <TabsTrigger value="code" className="data-[state=active]:bg-purple-700/40">Invite Code</TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-purple-700/40">Email Invite</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="space-y-4">
          <div className="text-sm text-gray-300">
            Generate an invitation code that students can use to join your class.
          </div>
          
          {invitationCode ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={invitationCode} readOnly className="font-mono bg-black/50 border-purple-500/30" />
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
                  Share via Gmail
                </Button>
                <Button
                  onClick={generateInviteCode}
                  className="bg-purple-600/50 hover:bg-purple-600 w-full"
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
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <div className="text-sm text-gray-300">
            Send an email invitation to a student's Gmail account. They'll receive instructions to join your class.
          </div>
          
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="student@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-black/50 border-purple-500/30"
            />
            <Button 
              onClick={handleInvite} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            The student will receive an email with instructions to join your class.
            If they don't have an account yet, they'll be guided to sign up.
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
