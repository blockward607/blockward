
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassJoinService } from '@/services/class-join';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const autoExtractCode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        
        if (codeFromUrl) {
          console.log("[useJoinClassProvider] Found code in URL:", codeFromUrl);
          
          setInvitationCode(codeFromUrl);
          
          if (user) {
            console.log("[useJoinClassProvider] User is logged in, attempting auto-join with code:", codeFromUrl);
            setAutoJoinInProgress(true);
            joinClassWithCode(codeFromUrl)
              .finally(() => setAutoJoinInProgress(false));
          } else {
            console.log("[useJoinClassProvider] User not logged in, saving code for later join");
          }
        }
      } catch (err) {
        console.error("[useJoinClassProvider] Error auto-extracting code:", err);
      }
    };

    autoExtractCode();
  }, [user]);

  const joinClassWithCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setIsJoining(true);
    
    try {
      console.log("[useJoinClassProvider] Joining class with code:", code);
      
      if (!user) {
        setError("Please log in to join a class");
        console.log("[useJoinClassProvider] No user, redirecting to auth");
        localStorage.setItem('pendingJoinCode', code);
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      if (!code) {
        setError("Please enter an invitation code");
        return;
      }
      
      console.log("[useJoinClassProvider] Processing join with code:", code);
      
      const { data: matchData, error: matchError } = 
        await ClassJoinService.findClassroomOrInvitation(code);
      
      console.log("Match result:", matchData, matchError);
      
      if (matchError || !matchData) {
        console.error("[useJoinClassProvider] Error finding classroom or invitation:", matchError);
        
        const errorMsg = matchError?.message || "Invalid code. Could not find a matching class.";
        setError(errorMsg);
        toast.error(errorMsg);
        
        // Always redirect to classes page after error with a delay
        setTimeout(() => {
          navigate('/classes', { 
            state: { errorMessage: "No matching class found for this code" } 
          });
        }, 2000);
        
        return;
      }
      
      const classroomId = matchData.classroomId;
      const classroomName = matchData.classroom?.name || "the classroom";
      const invitationId = matchData.invitationId;
      
      console.log("[useJoinClassProvider] Found classroom to join:", { classroomId, classroomName });
      
      const { data: existingEnrollment, error: enrollmentError } = 
        await ClassJoinService.checkEnrollment(classroomId);
      
      if (enrollmentError) {
        console.error("[useJoinClassProvider] Error checking enrollment:", enrollmentError);
      }
        
      if (existingEnrollment && existingEnrollment.length > 0) {
        console.log("[useJoinClassProvider] Student already enrolled in this classroom");
        toast.success("You are already a member of this classroom");
        navigate(`/class/${classroomId}`);
        return;
      }
      
      console.log("[useJoinClassProvider] Enrolling student in classroom:", { classroomId, invitationId });
      const { data: enrollData, error: enrollError } = await ClassJoinService.enrollStudent(classroomId, invitationId);
      
      if (enrollError) {
        console.error("[useJoinClassProvider] Error enrolling student:", enrollError);
        const errorMsg = "Error joining classroom: " + (enrollError.message || "Unknown error");
        setError(errorMsg);
        toast.error(errorMsg);
        
        // Redirect to classes page after error
        setTimeout(() => {
          navigate('/classes', { 
            state: { errorMessage: errorMsg } 
          });
        }, 2000);
        
        return;
      }

      console.log("[useJoinClassProvider] Successfully joined classroom:", classroomName);
      toast.success(`You've joined ${classroomName || 'the classroom'}`);
      
      navigate(`/class/${classroomId}`);
      
    } catch (error: any) {
      console.error("[useJoinClassProvider] Error joining class:", error);
      const errorMsg = error.message || "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Always redirect to classes page after error
      setTimeout(() => {
        navigate('/classes', { 
          state: { errorMessage: errorMsg } 
        });
      }, 2000);
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  }, [user, navigate]);

  return {
    invitationCode,
    setInvitationCode,
    scannerOpen,
    setScannerOpen,
    loading,
    setLoading,
    error,
    setError,
    joinClassWithCode,
    autoJoinInProgress
  };
};
