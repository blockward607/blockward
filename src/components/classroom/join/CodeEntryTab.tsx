
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinClassContext } from "./JoinClassContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { codeExtractor } from "@/utils/codeExtractor";

export const CodeEntryTab = () => {
  const { 
    invitationCode, 
    setInvitationCode, 
    loading, 
    error, 
    joinClassWithCode,
    autoJoinInProgress
  } = useJoinClassContext();
  
  const [enteredCode, setEnteredCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Set enteredCode to invitationCode when invitationCode changes (from URL)
  useEffect(() => {
    if (invitationCode && enteredCode !== invitationCode) {
      console.log("Setting entered code to invitation code:", invitationCode);
      setEnteredCode(invitationCode);
    }
  }, [invitationCode, enteredCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEnteredCode(value);
    
    // Extract code in real-time if it's a URL or complex format
    const extractedCode = codeExtractor.extractJoinCode(value);
    if (extractedCode && extractedCode !== value) {
      console.log("Extracted code in real-time:", extractedCode);
      setEnteredCode(extractedCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && enteredCode) {
      handleSubmitCode();
    }
  };

  // Handle submit and validation
  const handleSubmitCode = () => {
    if (!enteredCode) return;
    
    // Try to extract a code if it's a URL or complex format
    const processedCode = codeExtractor.extractJoinCode(enteredCode) || enteredCode;
    
    // Update the context code
    setInvitationCode(processedCode);
    
    console.log("[CodeEntryTab] Processing code for submission:", processedCode);
    joinClassWithCode(processedCode);
  };

  // Focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current && !autoJoinInProgress) {
      inputRef.current.focus();
    }
  }, [autoJoinInProgress]);

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
