
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Sparkles, Clipboard } from "lucide-react";
import { useJoinClassContext, JoinClassProvider } from "./JoinClassContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface JoinClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Wrapped inside JoinClassProvider below to provide the context. */
function ModalContent({ open, onOpenChange }: JoinClassModalProps) {
  const { classroomCode, setClassroomCode, loading, setError, error, joinClassWithCode } = useJoinClassContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    setLocalError(null);
    setError(null);
    setClassroomCode("");
    // eslint-disable-next-line
  }, [open]);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setClassroomCode(clipboardText.trim().toUpperCase());
      setLocalError(null);
      setError(null);
    } catch (err) {
      setLocalError("Could not access clipboard. Please paste manually.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClassroomCode(e.target.value.toUpperCase().replace(/\s/g, ""));
    setLocalError(null);
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);
    setError(null);

    if (isJoining || loading) return;
    const trimmedCode = classroomCode.trim().toUpperCase();
    if (!trimmedCode) {
      setLocalError("Please enter a classroom code");
      return;
    }
    if (trimmedCode.length < 4) {
      setLocalError("Codes must be at least 4 characters");
      return;
    }

    setIsJoining(true);
    try {
      await joinClassWithCode(trimmedCode);
      onOpenChange(false); // close modal on success, let code handle redirect
    } catch (err: any) {
      setLocalError(err.message || "Failed to join class");
      toast.error(err.message || "Failed to join class");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-[#25293A] border border-purple-500/30 shadow-2xl">
        <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white text-center">Join a Class</DialogTitle>
        </DialogHeader>
        <div className="mt-5">
          <div className="relative flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Class code (e.g. MPZBPL)"
              value={classroomCode}
              onChange={handleInputChange}
              className="bg-black/30 border-purple-500/20 pr-10 font-mono text-center text-base tracking-wider"
              disabled={loading || isJoining}
              autoFocus
              autoComplete="off"
              maxLength={10}
            />
            {!classroomCode && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={handlePaste}
                disabled={loading || isJoining}
              >
                <Clipboard className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
          {(error || localError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300 mt-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error || localError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>
        <DialogFooter className="flex gap-3 mt-4">
          <Button 
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || isJoining || !classroomCode.trim()}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {loading || isJoining ? (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Joining...
              </span>
            ) : (
              <span>Join</span>
            )}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Top-level component so the modal always has context
export function JoinClassModal(props: JoinClassModalProps) {
  return (
    <JoinClassProvider>
      <ModalContent {...props} />
    </JoinClassProvider>
  );
}
