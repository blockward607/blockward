
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";

export const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces
    const cleanedCode = e.target.value.toUpperCase().replace(/\s+/g, '');
    setInvitationCode(cleanedCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && invitationCode.trim()) {
      handleJoinClass();
    }
  };

  return (
    <div className="flex gap-3">
      <Input
        value={invitationCode}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter invitation code"
        className="flex-1 bg-black/60 border-purple-500/30"
        autoComplete="off"
      />
      <Button
        onClick={handleJoinClass}
        disabled={loading || !invitationCode.trim()}
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
