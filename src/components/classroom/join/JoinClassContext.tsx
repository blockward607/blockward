
import React, { createContext, useContext, useState } from 'react';
import { useJoinClassProvider } from './hooks/useJoinClassProvider';
import type { GoogleClassroom } from '@/services/google-classroom';

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
  googleClassrooms: GoogleClassroom[];
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
  googleClassrooms: [],
});

// Export the useContext hook
export const useJoinClassContext = () => useContext(JoinClassContext);

// Export the provider component
export const JoinClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the hook to get all the implementation
  const contextValue = useJoinClassProvider();
  
  return (
    <JoinClassContext.Provider value={contextValue}>
      {children}
    </JoinClassContext.Provider>
  );
};

// Re-export the hook
export { useJoinClassProvider } from './hooks/useJoinClassProvider';
