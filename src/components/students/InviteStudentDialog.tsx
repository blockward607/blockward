import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Mail, Link2, Loader2, Copy } from "lucide-react";
import { AuthService } from "@/services/AuthService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteStudentDialogProps {
  onAddStudent: (name: string, school: string) => Promise<void>;
}

export const InviteStudentDialog = ({ onAddStudent }: InviteStudentDialogProps) => {
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddStudent = async () => {
    await onAddStudent(newStudentName, newStudentSchool);
    setNewStudentName("");
    setNewStudentSchool("");
    setOpen(false);
  };

  const handleSendEmailInvitation = async () => {
    if (!studentEmail || !studentEmail.includes('@') || !studentEmail.includes('.')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      });
      return;
    }

    setLoading(true);
    try {
      // Get first classroom of the teacher
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to send invitations"
        });
        return;
      }

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Teacher profile not found"
        });
        return;
      }

      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', teacherProfile.id)
        .limit(1);

      if (!classrooms || classrooms.length === 0) {
        toast({
          variant: "destructive",
          title: "No Classroom",
          description: "Please create a classroom first"
        });
        return;
      }

      const classroom = classrooms[0];
      const teacherName = session.user.user_metadata?.name || 'Your Teacher';

      // Create invitation
      const { data } = await AuthService.createClassInvitation(classroom.id, studentEmail);
      
      if (data) {
        // Send email invitation
        await AuthService.sendEmailInvitation(
          studentEmail,
          teacherName,
          classroom.name,
          data.invitation_token
        );
        
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${studentEmail}`
        });
        
        setStudentEmail("");
        setOpen(false);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Get first classroom of the teacher
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
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Teacher profile not found"
        });
        return;
      }

      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', teacherProfile.id)
        .limit(1);

      if (!classrooms || classrooms.length === 0) {
        toast({
          variant: "destructive",
          title: "No Classroom",
          description: "Please create a classroom first"
        });
        return;
      }

      const { data } = await AuthService.createClassInvitation(classrooms[0].id);
      
      if (data) {
        setInvitationCode(data.invitation_token);
        toast({
          title: "Code Generated",
          description: "Invitation code generated successfully"
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate invitation code"
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-lg py-6 px-4">
          <PlusCircle className="w-5 h-5" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-white">Add Student</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="email">Email Invite</TabsTrigger>
            <TabsTrigger value="code">Invite Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4 mt-4">
            <Input
              placeholder="Student name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="bg-black/50 border-purple-500/30 text-white"
            />
            <Input
              placeholder="School (optional)"
              value={newStudentSchool}
              onChange={(e) => setNewStudentSchool(e.target.value)}
              className="bg-black/50 border-purple-500/30 text-white"
            />
            <Button 
              onClick={handleAddStudent} 
              className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
            >
              Add Student
            </Button>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="text-sm text-gray-300 mb-2">
              Send an email invitation to a student's email address. They'll receive instructions to join your class.
            </div>
            <Input
              type="email"
              placeholder="student@gmail.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="bg-black/50 border-purple-500/30 text-white"
            />
            <Button 
              onClick={handleSendEmailInvitation} 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Email Invitation
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="text-sm text-gray-300 mb-2">
              Generate an invitation code that students can use to join your class.
            </div>
            
            {invitationCode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={invitationCode} 
                    readOnly 
                    className="font-mono bg-black/50 border-purple-500/30 text-white"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className="bg-purple-600/20 border-purple-500/30"
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
                className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg flex items-center justify-center gap-2"
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
