
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

interface InviteStudentsProps {
  classroomId: string;
}

export const InviteStudents = ({ classroomId }: InviteStudentsProps) => {
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

    setLoading(true);
    try {
      const { error } = await supabase
        .from('class_invitations')
        .insert([
          { 
            classroom_id: classroomId,
            email: email.toLowerCase(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="email"
        placeholder="student@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-xs"
      />
      <Button 
        onClick={handleInvite} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        <Mail className="w-4 h-4" />
        Invite
      </Button>
    </div>
  );
};
