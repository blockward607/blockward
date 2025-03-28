
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ClassJoinService } from '@/services/class-join';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
};

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
});

export const useJoinClassContext = () => useContext(JoinClassContext);

export const JoinClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const joinClassWithCode = useCallback(async (classCode: string) => {
    if (!classCode.trim()) {
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
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to join class with code:', classCode);

      const cleanCode = classCode.trim().toUpperCase();

      // Process code to extract the actual invitation code (handle URLs, etc.)
      const processedCode = ClassJoinService.extractCodeFromInput(cleanCode) || cleanCode;
      console.log('Processed code for joining:', processedCode);
      
      const { data: foundClass, error: findError } = await ClassJoinService.findClassroomOrInvitation(processedCode);
      
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
      
      if (foundClass.invitationId) {
        await ClassJoinService.acceptInvitation(foundClass.invitationId);
      }
      
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
  }, [user, toast, navigate, setInvitationCode, setLoading, setError]);

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
  };

  return (
    <JoinClassContext.Provider value={contextValue}>
      {children}
    </JoinClassContext.Provider>
  );
};
