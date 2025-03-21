
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
    // Store raw input as user types, but convert to uppercase for display
    const value = e.target.value;
    // Remove spaces and convert to uppercase immediately for better UX
    const displayValue = value.replace(/\s+/g, '').toUpperCase();
    setInvitationCode(displayValue);
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
          const cleanCode = code.replace(/\s+/g, '').trim().toUpperCase();
          setInvitationCode(cleanCode);
          setAutoJoinAttempted(true);
          
          // Attempt to join after a small delay to ensure state is updated
          setTimeout(() => {
            console.log("[CodeEntryTab] Attempting to join with code:", cleanCode);
            handleJoinClass();
          }, 500);
        }
      } catch (error) {
        console.error("[CodeEntryTab] Error in auto-join:", error);
      }
    };
    
    attemptAutoJoin();
  }, [loading, autoJoinAttempted, handleJoinClass, setInvitationCode]);

  const handleSubmitCode = () => {
    // Normalize code before submission - this is critical
    if (!invitationCode) return;
    
    console.log("[CodeEntryTab] Submitting code:", invitationCode);
    
    // Execute join logic
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
