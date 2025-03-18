
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

interface EmailInviteTabProps {
  classroomId: string;
  teacherName: string;
  classroomName: string;
}

export const EmailInviteTab = ({ classroomId, teacherName, classroomName }: EmailInviteTabProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    try {
      setLoading(true);
      console.log("Starting email invitation process for:", email);
      
      // Generate a simple invitation token
      const invitationToken = Array.from({length: 8}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      console.log("Generated invitation token:", invitationToken);
      
      // First check if the session is active
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to send invitations");
      }
      
      console.log("Current classroom ID:", classroomId);
      
      // Create invitation in database
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: email.toLowerCase(),
          invitation_token: invitationToken,
          status: 'pending'
        })
        .select()
        .single();
      
      if (inviteError) {
        console.error("Error creating invitation:", inviteError);
        throw new Error(inviteError.message || 'Failed to create invitation');
      }
      
      if (!invitation) {
        throw new Error("Failed to create invitation record");
      }
      
      console.log("Created invitation in database:", invitation);

      // Call the edge function to send the email
      console.log("Calling edge function with data:", {
        email,
        verificationToken: invitation.invitation_token,
        teacherName,
        className: classroomName
      });
      
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

      console.log("Response from edge function:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Edge function error:", errorData);
        throw new Error(errorData.message || 'Failed to send email invitation');
      }
      
      const responseData = await response.json();
      console.log("Email sent successfully:", responseData);
      
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setEmail("");
    } catch (error: any) {
      console.error("Error in handleInvite:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};
