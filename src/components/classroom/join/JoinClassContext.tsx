
import React, { createContext, useContext, useState } from 'react';
import { useJoinClassroomCode } from './hooks/useJoinClassroomCode';

// Define the context type
type JoinClassContextType = {
  classroomCode: string;
  setClassroomCode: (code: string) => void;
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  joinClassWithCode: (code: string) => Promise<void>;
  autoJoinInProgress: boolean;
};

// Create the context with default values
const JoinClassContext = createContext<JoinClassContextType>({
  classroomCode: '',
  setClassroomCode: () => {},
  scannerOpen: false,
  setScannerOpen: () => {},
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
  joinClassWithCode: async () => {},
  autoJoinInProgress: false,
});

// Export the useContext hook
export const useJoinClassContext = () => useContext(JoinClassContext);

// Export the provider component
export const JoinClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classroomCode, setClassroomCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  
  // Use the hook to get join functionality
  const { joinWithCode, isJoining } = useJoinClassroomCode();
  
  const joinClassWithCode = async (code: string) => {
    setLoading(true);
    setError(null);
    setAutoJoinInProgress(true);
    
    try {
      const success = await joinWithCode(code);
      if (!success) {
        setError('Failed to join classroom');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join classroom');
    } finally {
      setLoading(false);
      setAutoJoinInProgress(false);
    }
  };
  
  const contextValue: JoinClassContextType = {
    classroomCode,
    setClassroomCode,
    scannerOpen,
    setScannerOpen,
    loading: loading || isJoining,
    setLoading,
    error,
    setError,
    joinClassWithCode,
    autoJoinInProgress,
  };
  
  return (
    <JoinClassContext.Provider value={contextValue}>
      {children}
    </JoinClassContext.Provider>
  );
};

// Re-export the hook
export { useJoinClassroomCode } from './hooks/useJoinClassroomCode';
