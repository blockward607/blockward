
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading, error } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store input as user types and standardize display
    const value = e.target.value;
    setInvitationCode(value.trim().toUpperCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && invitationCode) {
      handleSubmitCode();
    }
  };

  // Focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Try to join with code from URL query param if present
  useEffect(() => {
    const attemptAutoJoin = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code && !loading && !autoJoinAttempted) {
          console.log("[CodeEntryTab] Auto-joining with code from URL:", code);
          
          // Set the code in state - clean it immediately
          const cleanCode = code.trim().toUpperCase();
          setInvitationCode(cleanCode);
          setAutoJoinAttempted(true);
          
          // Attempt to join with a small delay to ensure state is updated
          setTimeout(() => {
            console.log("[CodeEntryTab] Attempting to join with code:", cleanCode);
            handleJoinClass();
          }, 100);
        }
      } catch (error) {
        console.error("[CodeEntryTab] Error in auto-join:", error);
      }
    };
    
    attemptAutoJoin();
  }, [loading, autoJoinAttempted, handleJoinClass, setInvitationCode]);

  const handleSubmitCode = () => {
    if (!invitationCode) return;
    
    // Just use the code as-is since we clean it when setting state
    console.log("[CodeEntryTab] Submitting code:", invitationCode);
    handleJoinClass();
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-3">
        <Input
          ref={inputRef}
          value={invitationCode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter classroom code"
          className="flex-1 bg-black/60 border-purple-500/30 font-mono text-lg uppercase"
          autoComplete="off"
          maxLength={10}
          disabled={loading}
        />
        <Button
          onClick={handleSubmitCode}
          disabled={loading || !invitationCode}
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
              Join
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        Enter the class code provided by your teacher.
      </p>
    </div>
  );
};
