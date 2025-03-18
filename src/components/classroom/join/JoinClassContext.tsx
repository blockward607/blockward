
import React, { createContext, useContext, useState } from 'react';
import { ClassJoinService } from '@/services/class-join';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

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

  const joinClassWithCode = async (classCode: string) => {
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
        setError('You are already enrolled in this class');
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this class',
        });
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
  };

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
