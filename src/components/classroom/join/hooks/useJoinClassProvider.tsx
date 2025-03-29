
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassJoinService } from '@/services/class-join';
import { useToast } from '@/hooks/use-toast';
import { useProcessInvitationCode } from './useProcessInvitationCode';
import { useAuth } from '@/hooks/use-auth';

export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { processInvitationCode } = useProcessInvitationCode();

  // Auto-extract code from URL if present
  useEffect(() => {
    const autoExtractCode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        
        if (codeFromUrl) {
          console.log("[useJoinClassProvider] Found code in URL:", codeFromUrl);
          const processedCode = processInvitationCode(codeFromUrl);
          
          if (processedCode) {
            console.log("[useJoinClassProvider] Setting invitation code from URL:", processedCode);
            setInvitationCode(processedCode);
            
            // Only auto-join if we have a valid code and the user is logged in
            if (user) {
              console.log("[useJoinClassProvider] User is logged in, attempting auto-join with code:", processedCode);
              setAutoJoinInProgress(true);
              joinClassWithCode(processedCode)
                .finally(() => setAutoJoinInProgress(false));
            } else {
              console.log("[useJoinClassProvider] User not logged in, saving code for later join");
            }
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
    
    try {
      console.log("[useJoinClassProvider] Joining class with code:", code);
      
      if (!user) {
        setError("Please log in to join a class");
        console.log("[useJoinClassProvider] No user, redirecting to auth");
        // Save the code to localStorage for after login
        localStorage.setItem('pendingJoinCode', code);
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      if (!code) {
        setError("Please enter an invitation code");
        return;
      }

      // Process the input to extract a valid code
      const processedCode = processInvitationCode(code);
      
      if (!processedCode) {
        setError("Invalid code format");
        return;
      }
      
      console.log("[useJoinClassProvider] Processing join with cleaned code:", processedCode);
      
      // First, find the classroom or invitation in the database
      const result = await ClassJoinService.findClassroomOrInvitation(processedCode);
      
      if (result.error) {
        console.error("[useJoinClassProvider] Error finding classroom/invitation:", result.error);
        setError(result.error.message);
        return;
      }
      
      if (!result.data) {
        setError("Invitation not found or expired");
        return;
      }
      
      console.log("[useJoinClassProvider] Found classroom/invitation:", result.data);
      
      // Check if student is already enrolled in this classroom
      const enrollmentCheck = await ClassJoinService.checkEnrollment(
        result.data.classroomId
      );
      
      if (enrollmentCheck.error) {
        console.error("[useJoinClassProvider] Error checking enrollment:", enrollmentCheck.error);
        setError(enrollmentCheck.error.message);
        return;
      }
      
      if (enrollmentCheck.data && enrollmentCheck.data.length > 0) {
        setError("You are already enrolled in this class");
        return;
      }
      
      console.log("[useJoinClassProvider] Student not enrolled, proceeding with enrollment");
      
      // Enroll the student in the classroom - passing both parameters correctly
      const { error: joinError } = await ClassJoinService.enrollStudent(
        result.data.classroomId,
        result.data.invitationId
      );
      
      if (joinError) {
        console.error("[useJoinClassProvider] Error enrolling student:", joinError);
        setError(joinError.message);
        return;
      }
      
      console.log("[useJoinClassProvider] Student successfully enrolled");
      
      // Success! Navigate to the classroom
      toast({
        title: "Success!",
        description: `You've joined ${result.data.classroom?.name || 'the classroom'}`
      });
      
      // Navigate to class detail page
      navigate(`/class/${result.data.classroomId}`);
      
    } catch (err: any) {
      console.error("[useJoinClassProvider] Unexpected error in joinClassWithCode:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [navigate, user, toast]);

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
