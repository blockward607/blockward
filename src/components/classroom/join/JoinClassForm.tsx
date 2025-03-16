
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { handleJoinClassWithCode } from "./join-class-utils";

interface JoinClassFormProps {
  invitationCode: string;
  setInvitationCode: (code: string) => void;
}

export const JoinClassForm = ({ 
  invitationCode, 
  setInvitationCode 
}: JoinClassFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinClass = async () => {
    if (!invitationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an invitation code"
      });
      return;
    }

    setLoading(true);
    try {
      await handleJoinClassWithCode(invitationCode, toast);
      setInvitationCode("");
      
      // Reload the page to show the newly joined class
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join class"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Input
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value)}
        placeholder="Enter invitation code"
        className="flex-1 bg-black/60 border-purple-500/30"
      />
      <Button
        onClick={handleJoinClass}
        disabled={loading}
        className="bg-purple-700 hover:bg-purple-800"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Join Class
          </>
        )}
      </Button>
    </div>
  );
};
