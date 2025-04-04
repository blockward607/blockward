
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailInviteTabProps {
  onSuccess: () => void;
  classroomId?: string;
}

export const EmailInviteTab = ({ onSuccess, classroomId }: EmailInviteTabProps) => {
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
      // Get user session and teacher profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to send invitations"
        });
        setLoading(false);
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
        setLoading(false);
        return;
      }

      // Get the classroom - either the one provided as prop or the first classroom
      let classroom;
      if (classroomId) {
        const { data: classroomData } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('id', classroomId)
          .single();
        
        classroom = classroomData;
      } else {
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
            description: "Please create a classroom first"
          });
          setLoading(false);
          return;
        }
        
        classroom = classrooms[0];
      }
      
      if (!classroom) {
        toast({
          variant: "destructive",
          title: "Classroom Not Found",
          description: "Please make sure the classroom exists"
        });
        setLoading(false);
        return;
      }

      const teacherName = teacherProfile.full_name || session.user.user_metadata?.name || 'Your Teacher';

      // Generate a unique invitation token
      const invitationToken = Array.from({length: 8}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');

      // Create invitation in database
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroom.id,
          email: studentEmail.toLowerCase(),
          invitation_token: invitationToken,
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
          email: studentEmail,
          verificationToken: invitation.invitation_token,
          teacherName: teacherName,
          className: classroom.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email invitation');
      }
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${studentEmail}`
      });
      
      setStudentEmail("");
      onSuccess();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitation"
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
