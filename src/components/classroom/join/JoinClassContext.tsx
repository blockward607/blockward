
import React, { createContext, useContext, useState } from 'react';

// Define the context type
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
  autoJoinInProgress: boolean;
};

// Create the context with default values
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
  autoJoinInProgress: false,
});

// Export the useContext hook
export const useJoinClassContext = () => useContext(JoinClassContext);

// Export the provider component that uses the implementation from useJoinClassProvider
export const JoinClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Import the hook with all the implementation
  const contextValue = useJoinClassProvider();
  
  return (
    <JoinClassContext.Provider value={contextValue}>
      {children}
    </JoinClassContext.Provider>
  );
};

// Re-export the hook to maintain backward compatibility
export { useJoinClassProvider } from './hooks/useJoinClassProvider';
