import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinClassContext } from "./JoinClassContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Clipboard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useProcessInvitationCode } from "./hooks/useProcessInvitationCode";

const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, joinClassWithCode, loading, error } = useJoinClassContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { processInvitationCode } = useProcessInvitationCode();
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    try {
      const trimmedCode = invitationCode.trim();
      
      if (!trimmedCode) {
        setLocalError("Please enter an invitation code");
        return;
      }
      
      const processedCode = processInvitationCode(trimmedCode);
      
      if (!processedCode) {
        setLocalError("Invalid code format");
        return;
      }
      
      await joinClassWithCode(processedCode);
    } catch (err: any) {
      console.error("Error in join form:", err);
      setLocalError(err.message || "An unexpected error occurred");
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log("Pasted text:", clipboardText);
      
      const extractedCode = processInvitationCode(clipboardText);
      
      if (extractedCode) {
        console.log("Extracted code from clipboard:", extractedCode);
        setInvitationCode(extractedCode);
      } else {
        setInvitationCode(clipboardText);
      }
    } catch (err) {
      console.error("Error accessing clipboard:", err);
      setLocalError("Could not access clipboard. Please paste manually.");
    }
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
              onChange={(e) => setInvitationCode(e.target.value)}
              className="bg-black/20 border-purple-500/30 pr-10 font-mono"
              disabled={loading}
              autoFocus
              autoComplete="off"
            />
            {!invitationCode && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1"
                onClick={handlePaste}
                disabled={loading}
              >
                <Clipboard className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-400">
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-5"
          >
            {loading ? (
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
