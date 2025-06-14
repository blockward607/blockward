
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinClassContext } from "./JoinClassContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clipboard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading, setError, error, joinClassWithCode } = useJoinClassContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);
    
    if (isJoining || loading) return;
    
    const trimmedCode = invitationCode.trim().toUpperCase();
    
    if (!trimmedCode) {
      setLocalError("Please enter an invitation code");
      return;
    }
    
    // Basic validation - codes should be at least 4 characters
    if (trimmedCode.length < 4) {
      setLocalError("Invitation codes must be at least 4 characters long");
      return;
    }
    
    setIsJoining(true);
    
    try {
      console.log("Submitting code for join:", trimmedCode);
      await joinClassWithCode(trimmedCode);
    } catch (err: any) {
      console.error("Error in join form:", err);
      const errorMessage = err.message || "Failed to join classroom";
      setLocalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log("Pasted text:", clipboardText);
      
      // Clean up the pasted text and convert to uppercase
      const cleanedText = clipboardText.trim().toUpperCase();
      setInvitationCode(cleanedText);
      setLocalError(null);
      setError(null);
    } catch (err) {
      console.error("Error accessing clipboard:", err);
      setLocalError("Could not access clipboard. Please paste manually.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces as user types
    const value = e.target.value.toUpperCase().replace(/\s/g, '');
    setInvitationCode(value);
    setLocalError(null);
    setError(null);
  };

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter invitation code (e.g. UK5CRH)"
              value={invitationCode}
              onChange={handleInputChange}
              className="bg-black/20 border-purple-500/30 pr-10 font-mono text-center text-lg tracking-wider"
              disabled={loading || isJoining}
              autoFocus
              autoComplete="off"
              maxLength={10}
            />
            {!invitationCode && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1"
                onClick={handlePaste}
                disabled={loading || isJoining}
              >
                <Clipboard className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-400 text-center">
            Enter the code shared by your teacher
          </p>
        </div>

        {(error || localError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={loading || isJoining || !invitationCode.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-5"
          >
            {loading || isJoining ? (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Joining...
              </span>
            ) : (
              <span>Join Class</span>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default CodeEntryTab;
