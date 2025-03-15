
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Copy, Users, Link2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AuthService } from "@/services/AuthService";

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
      const { data } = await AuthService.createClassInvitation(classroomId, email);

      if (data) {
        setInvitationCode(data.invitation_token);
        
        // Send email invitation
        await AuthService.sendEmailInvitation(
          email, 
          teacherName, 
          classroomName, 
          data.invitation_token
        );
        
        toast({
          title: "Success",
          description: "Invitation sent successfully",
        });
        setEmail("");
      }
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
      const { data } = await AuthService.createClassInvitation(classroomId);
      
      if (data) {
        setInvitationCode(data.invitation_token);
        
        toast({
          title: "Invitation Code Generated",
          description: "Share this code with your students",
        });
      }
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
