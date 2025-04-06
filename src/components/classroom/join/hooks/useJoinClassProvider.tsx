
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassJoinService } from '@/services/class-join';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useGoogleClassroom } from './useGoogleClassroom';
import { toast } from 'sonner';

export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use our Google Classroom hook
  const { 
    googleClassrooms, 
    checkGoogleClassroomCode,
    authenticateWithGoogle: authenticate,
    isAuthenticated: googleAuthenticated
  } = useGoogleClassroom(user?.id);

  // Sync isAuthenticated status from the googleAuthenticated value
  useEffect(() => {
    setIsAuthenticated(googleAuthenticated);
  }, [googleAuthenticated]);

  // Auto-extract code from URL if present
  useEffect(() => {
    const autoExtractCode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        
        if (codeFromUrl) {
          console.log("[useJoinClassProvider] Found code in URL:", codeFromUrl);
          
          // Set the code without processing
          setInvitationCode(codeFromUrl);
          
          // Only auto-join if we have a valid code and the user is logged in
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

  const authenticateWithGoogle = async () => {
    try {
      console.log("Attempting to authenticate with Google...");
      const success = await authenticate();
      if (success) {
        console.log("Successfully authenticated with Google Classroom");
        toast.success("Successfully connected to Google Classroom");
        return true;
      } else {
        console.log("Failed to authenticate with Google Classroom");
        toast.error("Could not connect to Google Classroom");
        return false;
      }
    } catch (err) {
      console.error("Error authenticating with Google:", err);
      toast.error("Error connecting to Google Classroom");
      return false;
    }
  };

  const joinClassWithCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setIsJoining(true);
    
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
      
      console.log("[useJoinClassProvider] Processing join with code:", code);
      
      // First try local matching
      const { data: matchData, error: matchError } = 
        await ClassJoinService.findClassroomOrInvitation(code);
      
      console.log("Match result:", matchData, matchError);
      
      if (matchError || !matchData) {
        console.error("[useJoinClassProvider] Error finding classroom or invitation:", matchError);
        
        // If no local match, try Google Classroom
        try {
          // If not authenticated with Google yet, try to authenticate
          if (!isAuthenticated) {
            const didAuthenticate = await authenticateWithGoogle();
            if (!didAuthenticate) {
              setError("Could not authenticate with Google Classroom. Please try again.");
              return;
            }
          }
          
          // Now check for matching Google class
          const matchingGoogleClass = await checkGoogleClassroomCode(code);
          
          if (matchingGoogleClass) {
            toast.success(`Found Google Classroom: ${matchingGoogleClass.name}`);
            
            // Here you could add logic to save the Google Classroom to your local database
            navigate('/dashboard');
            return;
          } else {
            // No match found in Google Classroom either
            setError(matchError?.message || "Invalid code. Could not find a matching class.");
          }
        } catch (googleError) {
          console.error("Error checking Google Classroom:", googleError);
          setError("Could not verify Google Classroom code. Please try again.");
        }
        
        return;
      }
      
      // Determine the classroom to join
      const classroomId = matchData.classroomId;
      const classroomName = matchData.classroom?.name || "the classroom";
      const invitationId = matchData.invitationId;
      
      console.log("[useJoinClassProvider] Found classroom to join:", { classroomId, classroomName });
      
      // Check if already enrolled
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
      
      // Enroll the student
      console.log("[useJoinClassProvider] Enrolling student in classroom:", { classroomId, invitationId });
      const { data: enrollData, error: enrollError } = await ClassJoinService.enrollStudent(classroomId, invitationId);
      
      if (enrollError) {
        console.error("[useJoinClassProvider] Error enrolling student:", enrollError);
        setError("Error joining classroom: " + (enrollError.message || "Unknown error"));
        return;
      }

      // Success!
      console.log("[useJoinClassProvider] Successfully joined classroom:", classroomName);
      toast.success(`You've joined ${classroomName || 'the classroom'}`);
      
      // Redirect to class details page
      navigate(`/class/${classroomId}`);
      
    } catch (error: any) {
      console.error("[useJoinClassProvider] Error joining class:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  }, [user, navigate, checkGoogleClassroomCode, isAuthenticated]);

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
    autoJoinInProgress,
    googleClassrooms,
    // Add these properties to match the context type
    isAuthenticated,
    authenticateWithGoogle
  };
};
