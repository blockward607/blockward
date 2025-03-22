
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ClassJoinService } from "@/services/class-join";

export const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading, error } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store input as user types but don't immediately set the invitationCode
    // This allows for better validation before submission
    setEnteredCode(e.target.value.trim().toUpperCase());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && enteredCode) {
      handleSubmitCode();
    }
  };

  // Handle submit and validation
  const handleSubmitCode = () => {
    if (!enteredCode) return;
    
    console.log("[CodeEntryTab] Processing code for submission:", enteredCode);
    
    // Process and clean the code before joining
    const processedCode = ClassJoinService.extractCodeFromInput(enteredCode);
    console.log("[CodeEntryTab] Processed code for joining:", processedCode);
    
    if (processedCode) {
      setInvitationCode(processedCode);
      handleJoinClass();
    } else {
      // If code couldn't be processed, try with original input as a fallback
      console.log("[CodeEntryTab] Using original input as fallback:", enteredCode);
      setInvitationCode(enteredCode);
      handleJoinClass();
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
        
        // Check URL query parameters (highest priority)
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code') || urlParams.get('join');
        
        // Check location state (from direct link navigation)
        if (!code && location.state && location.state.joinCode) {
          code = location.state.joinCode;
        }
        
        // Try to extract from the full URL if no explicit code parameter is found
        if (!code) {
          const fullUrl = window.location.href;
          code = ClassJoinService.extractCodeFromInput(fullUrl);
        }
        
        if (code) {
          console.log("[CodeEntryTab] Auto-joining with potential code:", code);
          
          // Process the code with a more robust extraction logic
          const processedCode = ClassJoinService.extractCodeFromInput(code);
          
          if (processedCode) {
            console.log("[CodeEntryTab] Processed code for auto-join:", processedCode);
            
            // Set the code in state
            setInvitationCode(processedCode);
            setEnteredCode(processedCode);
            setAutoJoinAttempted(true);
            
            // Small delay to ensure UI is ready
            setTimeout(() => {
              handleJoinClass();
            }, 500);
          } else {
            console.log("[CodeEntryTab] Could not process the code:", code);
          }
        }
      } catch (error) {
        console.error("[CodeEntryTab] Error in auto-join:", error);
      }
    };
    
    attemptAutoJoin();
  }, [loading, autoJoinAttempted, handleJoinClass, setInvitationCode, location]);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-3">
        <Input
          ref={inputRef}
          value={enteredCode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter classroom code (e.g., UKFCUY)"
          className="flex-1 bg-black/60 border-purple-500/30 font-mono text-lg text-center tracking-wider"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          disabled={loading}
        />
        <Button
          onClick={handleSubmitCode}
          disabled={loading || !enteredCode}
          className="bg-purple-700 hover:bg-purple-800 py-6"
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
        Enter the class code provided by your teacher, typically starting with "UK".
      </p>
      <p className="text-xs text-gray-400">
        You can also paste a full invitation link here.
      </p>
    </div>
  );
};
