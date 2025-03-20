
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
    // Clean and normalize the code (remove spaces, make uppercase)
    let value = e.target.value;
    // Don't trim while typing - only trim on submit
    // But convert to uppercase for consistency
    value = value.toUpperCase();
    setInvitationCode(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && invitationCode.trim()) {
      // Trim the code before joining
      const cleanCode = invitationCode.trim();
      setInvitationCode(cleanCode);
      handleJoinClass();
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
        
        if (code && code.trim() && !loading && !autoJoinAttempted) {
          console.log("Auto-joining with code from URL:", code);
          
          // Preserve original code formatting but normalize
          const cleanCode = code.trim().toUpperCase();
          setInvitationCode(cleanCode);
          setAutoJoinAttempted(true);
          
          // Small delay to ensure context is fully set up
          setTimeout(() => {
            console.log("Attempting to join with code:", cleanCode);
            handleJoinClass();
          }, 500);
        }
      } catch (error) {
        console.error("Error in auto-join:", error);
      }
    };
    
    attemptAutoJoin();
  }, [invitationCode, loading, autoJoinAttempted, handleJoinClass, setInvitationCode]);

  const handleSubmitCode = () => {
    // Clean the code before submission
    const cleanCode = invitationCode.trim().toUpperCase();
    if (cleanCode !== invitationCode) {
      setInvitationCode(cleanCode);
    }
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
          className="flex-1 bg-black/60 border-purple-500/30 font-mono text-lg"
          autoComplete="off"
          disabled={loading}
        />
        <Button
          onClick={handleSubmitCode}
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
