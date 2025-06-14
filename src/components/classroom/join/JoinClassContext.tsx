
import React, { createContext, useContext } from 'react';
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
  // Use the hook to get all the implementation
  const contextValue = useJoinClassroomCode();
  
  return (
    <JoinClassContext.Provider value={contextValue}>
      {children}
    </JoinClassContext.Provider>
  );
};

// Re-export the hook
export { useJoinClassroomCode } from './hooks/useJoinClassroomCode';
