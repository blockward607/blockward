
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";

export const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();

  return (
    <div className="flex gap-3">
      <Input
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
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
