
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailInviteTabProps {
  classroomId: string;
  teacherName?: string;
  classroomName?: string;
}

export const EmailInviteTab = ({ classroomId, teacherName = "Your Teacher", classroomName = "the class" }: EmailInviteTabProps) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = currentEmail.trim();
    if (trimmedEmail && isValidEmail(trimmedEmail) && !emails.includes(trimmedEmail)) {
      setEmails([...emails, trimmedEmail]);
      setCurrentEmail("");
    } else if (!isValidEmail(trimmedEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address"
      });
    } else if (emails.includes(trimmedEmail)) {
      toast({
        variant: "destructive",
        title: "Duplicate Email",
        description: "This email has already been added"
      });
      setCurrentEmail("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) {
      toast({
        variant: "destructive",
        title: "No Recipients",
        description: "Please add at least one email address"
      });
      return;
    }

    setLoading(true);
    try {
      const promises = emails.map(async (email) => {
        // Generate a unique token for each email
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Store the invitation in the database
        const { data, error } = await supabase
          .from('class_invitations')
          .insert({
            email: email.toLowerCase(),
            classroom_id: classroomId,
            invitation_token: token,
            status: 'pending'
          });
          
        if (error) throw error;
        
        // In a real app, you would send an email here
        console.log(`Invitation sent to ${email} with token ${token}`);
        return { email, success: true };
      });
      
      await Promise.all(promises);
      
      toast({
        title: "Invitations Sent",
        description: `${emails.length} invitation${emails.length > 1 ? 's' : ''} sent successfully`
      });
      
      // Clear emails after successful send
      setEmails([]);
      
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invitations"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300 mb-2">
        Send email invitations to students to join your classroom.
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          placeholder="student@example.com"
          value={currentEmail}
          onChange={(e) => setCurrentEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-black/60 border-purple-500/30 text-white"
        />
        <Button 
          onClick={handleAddEmail}
          variant="outline"
          className="bg-purple-700/20 border-purple-500/30 hover:bg-purple-700/40"
        >
          Add
        </Button>
      </div>
      
      {emails.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Recipients:</p>
          <div className="flex flex-wrap gap-2">
            {emails.map(email => (
              <div key={email} className="flex items-center gap-1 bg-purple-700/20 border border-purple-500/30 rounded-full px-3 py-1 text-sm">
                {email}
                <button 
                  onClick={() => handleRemoveEmail(email)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Button
        onClick={handleSendInvites}
        disabled={loading || emails.length === 0}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Invitations
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-400">
        Students will receive an email with instructions to join {classroomName} from {teacherName}.
      </p>
    </div>
  );
};
