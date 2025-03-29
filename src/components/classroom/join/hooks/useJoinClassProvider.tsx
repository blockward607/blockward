
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ClassJoinService } from '@/services/class-join';
import { codeExtractor } from '@/utils/codeExtractor';
import { useProcessInvitationCode } from './useProcessInvitationCode';

// Hook that contains all the implementation logic for the JoinClassContext
export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ inviteToken?: string }>();

  // Process invitation code from URL
  const { processInvitationCode } = useProcessInvitationCode();
  
  // Check URL for invitation code
  useEffect(() => {
    const checkForInvitationCode = async () => {
      try {
        console.log("Checking for invitation code in URL/params", { location, params });
        
        // First check URL parameters
        const { inviteToken } = params;
        if (inviteToken) {
          console.log("Found invite token in URL params:", inviteToken);
          const processedToken = codeExtractor.extractJoinCode(inviteToken) || inviteToken;
          setInvitationCode(processedToken);
          
          // Auto-join if user is already logged in
          if (user) {
            setAutoJoinInProgress(true);
            await joinClassWithCode(processedToken);
            setAutoJoinInProgress(false);
          }
          return;
        }
        
        // Check query params
        const searchParams = new URLSearchParams(location.search);
        let code = searchParams.get('code') || searchParams.get('join');
        
        // Check location state (from redirect)
        if (!code && location.state && location.state.joinCode) {
          code = location.state.joinCode;
        }
        
        // Check URL path segments for code-like patterns
        if (!code) {
          const pathSegments = location.pathname.split('/');
          for (const segment of pathSegments) {
            if (/^UK[A-Z0-9]{4}$/i.test(segment)) {
              code = segment;
              break;
            }
          }
        }
        
        if (code) {
          console.log("Found code in URL or state:", code);
          const processedCode = codeExtractor.extractJoinCode(code);
          if (processedCode) {
            console.log("Processed code:", processedCode);
            setInvitationCode(processedCode);
            
            // Auto-join if user is already logged in
            if (user) {
              setAutoJoinInProgress(true);
              await joinClassWithCode(processedCode);
              setAutoJoinInProgress(false);
              
              // Clean up URL
              if (window.history && window.history.replaceState) {
                const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                window.history.replaceState(
                  { ...location.state, joinCode: null }, 
                  document.title, 
                  newUrl
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Error checking for invitation code:", err);
      }
    };
    
    checkForInvitationCode();
  }, [location, user, params]); // Don't include joinClassWithCode in dependencies

  // Join class with code
  const joinClassWithCode = useCallback(async (classCode: string) => {
    if (!classCode || !classCode.trim()) {
      setError('Please enter a valid class code');
      return;
    }

    if (!user) {
      setError('You must be logged in to join a class');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to join a class',
        variant: 'destructive',
      });
      
      // Save the code and redirect to auth
      navigate('/auth', { 
        state: { joinCode: classCode.trim() } 
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to join class with code:', classCode);

      const cleanCode = classCode.trim();

      // Process code to extract the actual invitation code (handle URLs, etc.)
      const processedCode = processInvitationCode(cleanCode);
      console.log('Processed code for joining:', processedCode);
      
      const { data: foundClass, error: findError } = await ClassJoinService.findClassroomOrInvitation(processedCode);
      
      if (findError || !foundClass) {
        console.error('Error finding class:', findError);
        setError(findError?.message || 'Invalid class code. Please check and try again.');
        toast({
          title: 'Error',
          description: findError?.message || 'Invalid class code',
          variant: 'destructive',
        });
        return;
      }

      console.log('Found class/invitation:', foundClass);
      
      const { data: existingEnrollment, error: enrollmentError } = await ClassJoinService.checkEnrollment(
        user.id,
        foundClass.classroomId
      );
      
      if (enrollmentError) {
        console.error('Error checking enrollment:', enrollmentError);
      }
      
      if (existingEnrollment) {
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this class',
        });
        navigate(`/class/${foundClass.classroomId}`);
        return;
      }
      
      // Mark invitation as accepted if we're using one
      if (foundClass.invitationId) {
        console.log('Accepting invitation:', foundClass.invitationId);
        await ClassJoinService.acceptInvitation(foundClass.invitationId);
      }
      
      // Enroll the student in the class
      console.log('Enrolling student in class:', foundClass.classroomId);
      const { data: enrollment, error: enrollError } = await ClassJoinService.enrollStudent(
        user.id,
        foundClass.classroomId
      );
      
      if (enrollError) {
        console.error('Error enrolling student:', enrollError);
        setError(enrollError.message || 'Failed to join class');
        toast({
          title: 'Error',
          description: enrollError.message || 'Failed to join class',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Successfully joined class:', enrollment);
      toast({
        title: 'Success',
        description: 'You have successfully joined the class',
      });
      
      setInvitationCode('');
      navigate(`/class/${foundClass.classroomId}`);
      
    } catch (err: any) {
      console.error('Exception in joinClassWithCode:', err);
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, navigate, processInvitationCode]);

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
  };
};
