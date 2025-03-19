
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ClassJoinService } from '@/services/class-join';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Define context type with all required properties
type JoinClassContextType = {
  invitationCode: string;
  setInvitationCode: (code: string) => void;
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  joinClassWithCode: (code: string) => Promise<void>;
  handleScanResult: (text: string) => void;
};

// Create context with default values for all properties
const JoinClassContext = createContext<JoinClassContextType>({
  invitationCode: '',
  setInvitationCode: () => {},
  scannerOpen: false,
  setScannerOpen: () => {},
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  joinClassWithCode: async () => {},
  handleScanResult: () => {},
});

// Custom hook to use the context
export const useJoinClassContext = () => useContext(JoinClassContext);

export const JoinClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle QR code scan result
  const handleScanResult = useCallback((text: string) => {
    try {
      console.log("QR Scan result:", text);
      setScannerOpen(false);
      
      // Try to extract code from URL
      let code = text;
      
      // Check if it's a URL
      if (text.startsWith('http')) {
        try {
          const url = new URL(text);
          const codeParam = url.searchParams.get('code');
          if (codeParam) {
            code = codeParam;
          } else {
            // If no code param, try to use last path segment
            const pathParts = url.pathname.split('/').filter(p => p);
            if (pathParts.length > 0) {
              code = pathParts[pathParts.length - 1];
            }
          }
        } catch (e) {
          console.error("Error parsing URL from QR code:", e);
        }
      }
      
      // Set the code and auto-join
      setInvitationCode(code);
      
      // Only auto-join if we have a valid code
      if (code && code.length > 2) {
        joinClassWithCode(code);
      } else {
        setError("Invalid QR code. Please try again or enter code manually.");
      }
    } catch (err) {
      console.error("Error processing QR scan:", err);
      setError("Could not process QR code. Please enter the code manually.");
    }
  }, []);

  const joinClassWithCode = useCallback(async (classCode: string) => {
    if (!user) {
      setError('You must be logged in to join a class');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to join a class',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to join class with code:', classCode);

      // Find classroom or invitation by code
      const { data: foundClass, error: findError } = await ClassJoinService.findClassroomOrInvitation(classCode);
      
      if (findError || !foundClass) {
        console.error('Error finding class:', findError);
        setError(findError?.message || 'Invalid class code');
        toast({
          title: 'Error',
          description: findError?.message || 'Invalid class code',
          variant: 'destructive',
        });
        return;
      }

      console.log('Found class/invitation:', foundClass);
      
      // Check if student is already enrolled
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
      
      // If invitation exists, accept it
      if (foundClass.invitationId) {
        await ClassJoinService.acceptInvitation(foundClass.invitationId);
      }
      
      // Enroll student in classroom
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
      
      // Reset form state
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
  }, [user, toast, navigate]);

  const contextValue: JoinClassContextType = {
    invitationCode,
    setInvitationCode,
    scannerOpen,
    setScannerOpen,
    loading,
    setLoading,
    error,
    setError,
    joinClassWithCode,
    handleScanResult,
  };

  return (
    <JoinClassContext.Provider value={contextValue}>
      {children}
    </JoinClassContext.Provider>
  );
};
