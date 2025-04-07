
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinClassContext } from "./JoinClassContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clipboard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CodeEntryTab = () => {
  const { invitationCode, setInvitationCode, loading, setLoading, setError, error } = useJoinClassContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const [processingCode, setProcessingCode] = useState<string | null>(null);
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
    
    if (isJoining) return;
    setIsJoining(true);
    
    try {
      const trimmedCode = invitationCode.trim();
      
      if (!trimmedCode) {
        setLocalError("Please enter an invitation code");
        return;
      }
      
      // Use the code directly without processing
      setProcessingCode(trimmedCode);
      setLoading(true);
      
      console.log("Submitting code for join:", trimmedCode);
      
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You need to be logged in to join a class");
      }
      
      // Get the student ID for this user
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (studentError || !studentData) {
        console.error("Error getting student ID:", studentError);
        throw new Error(studentError?.message || "Student profile not found");
      }
      
      // Try direct invitations lookup
      const { data: invitationData, error: invitationError } = await supabase
        .from("class_invitations")
        .select("id, classroom_id")
        .eq("invitation_token", trimmedCode)
        .eq("status", "pending")
        .single();
        
      if (invitationError) {
        console.log("Direct invitation lookup failed, trying secondary matching");
        // Try to match by classroom ID
        const { data: classroomData, error: classroomError } = await supabase
          .from("classrooms")
          .select("id")
          .eq("id", trimmedCode)
          .single();
          
        if (classroomError) {
          throw new Error("Invalid invitation code");
        }
        
        // We found the classroom directly by ID
        const classroomId = classroomData.id;
        
        // Check if already enrolled
        const { data: enrollment, error: enrollmentError } = await supabase
          .from("classroom_students")
          .select("id")
          .eq("classroom_id", classroomId)
          .eq("student_id", studentData.id);
          
        if (enrollmentError) {
          console.error("Error checking enrollment:", enrollmentError);
        }
          
        if (enrollment && enrollment.length > 0) {
          toast.success("You are already enrolled in this classroom");
          return;
        }
        
        // Direct insert to join classroom
        const { data: joinData, error: joinError } = await supabase
          .from("classroom_students")
          .insert({
            classroom_id: classroomId,
            student_id: studentData.id
          });
          
        if (joinError) {
          throw new Error("Error joining classroom: " + joinError.message);
        }
      } else {
        // We found a valid invitation
        const classroomId = invitationData.classroom_id;
        
        // Check if already enrolled
        const { data: enrollment, error: enrollmentError } = await supabase
          .from("classroom_students")
          .select("id")
          .eq("classroom_id", classroomId)
          .eq("student_id", studentData.id);
          
        if (enrollmentError) {
          console.error("Error checking enrollment:", enrollmentError);
        }
          
        if (enrollment && enrollment.length > 0) {
          toast.success("You are already enrolled in this classroom");
          return;
        }
        
        // Use RPC function to handle enrollment with better permissions
        const { error: enrollError } = await supabase.rpc(
          'enroll_student', 
          {
            invitation_token: trimmedCode,
            student_id: studentData.id
          }
        );
        
        if (enrollError) {
          // Fallback: try direct insert
          const { error: directInsertError } = await supabase
            .from("classroom_students")
            .insert({
              classroom_id: classroomId,
              student_id: studentData.id
            });
            
          if (directInsertError) {
            throw new Error("Error joining classroom: " + directInsertError.message);
          }
          
          // Update invitation status
          await supabase
            .from("class_invitations")
            .update({ status: "accepted" })
            .eq("id", invitationData.id);
        }
      }
      
      toast.success("Successfully joined classroom!");
      
      // Refresh the classroom list to show the newly joined class
      setTimeout(() => {
        window.location.reload(); // Force refresh to update the class list
      }, 1000);
      
    } catch (err: any) {
      console.error("Error in join form:", err);
      setLocalError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Failed to join classroom");
    } finally {
      setLoading(false);
      setIsJoining(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log("Pasted text:", clipboardText);
      
      // Set the code directly without processing
      setInvitationCode(clipboardText.trim());
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

        {processingCode && !error && !localError && loading && (
          <p className="text-xs text-gray-400">
            Attempting to join with code: {processingCode}
          </p>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={loading || isJoining}
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
