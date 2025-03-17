
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading, error } = useJoinClassContext();
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

  // Try to join with code from URL query param if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && code.trim() && !loading) {
      console.log("Auto-joining with code from URL:", code);
      // Small delay to ensure context is fully set up
      const timer = setTimeout(() => {
        handleJoinClass();
      }, 800); // Increased timeout to ensure everything is loaded
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-3">
        <Input
          value={invitationCode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter invitation code"
          className="flex-1 bg-black/60 border-purple-500/30"
          autoComplete="off"
          disabled={loading}
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
      
      <p className="text-xs text-gray-400 mt-2">
        Enter the 6-character invitation code provided by your teacher.
        <br />
        <span className="font-semibold">Note: The code must exactly match your teacher's classroom ID.</span>
      </p>
    </div>
  );
};
