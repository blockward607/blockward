
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { InvitationMatchingService } from "@/services/class-join/InvitationMatchingService";

export const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading, error } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store input as user types and remove whitespace
    setInvitationCode(e.target.value.trim());
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

  // Try to join with code from URL query param or state
  useEffect(() => {
    const attemptAutoJoin = async () => {
      try {
        if (autoJoinAttempted || loading) return;

        let code = null;
        
        // Check URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code') || urlParams.get('join');
        
        // Check location state (from direct link navigation)
        if (!code && location.state && location.state.joinCode) {
          code = location.state.joinCode;
        }
        
        // Try to extract from the full URL if no explicit code parameter is found
        if (!code) {
          const fullUrl = window.location.href;
          console.log("[CodeEntryTab] Trying to extract code from full URL:", fullUrl);
          code = fullUrl;
        }
        
        if (code) {
          console.log("[CodeEntryTab] Auto-joining with potential code:", code);
          
          // Process the code using the service
          const processedCode = InvitationMatchingService.extractCodeFromInput(code);
          
          if (processedCode) {
            console.log("[CodeEntryTab] Processed code for auto-join:", processedCode);
            // Set the code in state (already trimmed)
            setInvitationCode(processedCode);
            setAutoJoinAttempted(true);
            
            // Small delay to ensure UI is ready
            setTimeout(() => {
              handleJoinClass();
            }, 500);
          }
        }
      } catch (error) {
        console.error("[CodeEntryTab] Error in auto-join:", error);
      }
    };
    
    attemptAutoJoin();
  }, [loading, autoJoinAttempted, handleJoinClass, setInvitationCode, location]);

  const handleSubmitCode = () => {
    if (!invitationCode) return;
    
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
          placeholder="Enter classroom code or paste join link"
          className="flex-1 bg-black/60 border-purple-500/30 font-mono text-lg"
          autoComplete="off"
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
        Enter the class code or paste the join link provided by your teacher.
      </p>
    </div>
  );
};
