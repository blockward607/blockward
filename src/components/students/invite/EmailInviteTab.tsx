
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "@/services/AuthService";

interface EmailInviteTabProps {
  onSuccess: () => void;
}

export const EmailInviteTab = ({ onSuccess }: EmailInviteTabProps) => {
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
        .maybeSingle();

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
        onSuccess();
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

  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm text-gray-300 mb-2">
        Send an email invitation to a student's email address. They'll receive instructions to join your class.
      </div>
      <Input
        type="email"
        placeholder="student@gmail.com"
        value={studentEmail}
        onChange={(e) => setStudentEmail(e.target.value)}
        className="bg-black/60 border-purple-500/30 text-white"
      />
      <Button 
        onClick={handleSendEmailInvitation} 
        disabled={loading}
        className="w-full bg-purple-700 hover:bg-purple-800 py-6 text-lg flex items-center justify-center gap-2"
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
    </div>
  );
};
