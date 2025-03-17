
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface JoinClassContextType {
  invitationCode: string;
  setInvitationCode: (code: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const JoinClassContext = createContext<JoinClassContextType | undefined>(undefined);

export const JoinClassProvider = ({ children }: { children: ReactNode }) => {
  // Extract code from URL if present
  const getCodeFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code') || '';
  };
  
  const [invitationCode, setInvitationCode] = useState<string>(getCodeFromURL().toUpperCase());
  const [loading, setLoading] = useState<boolean>(false);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update code if URL changes
  useEffect(() => {
    const code = getCodeFromURL();
    if (code) {
      setInvitationCode(code.toUpperCase());
    }
  }, [window.location.search]);

  // Log context state for debugging
  useEffect(() => {
    console.log("JoinClassContext state:", { 
      invitationCode, 
      loading, 
      scannerOpen,
      error
    });
  }, [invitationCode, loading, scannerOpen, error]);

  return (
    <JoinClassContext.Provider
      value={{
        invitationCode,
        setInvitationCode,
        loading,
        setLoading,
        scannerOpen,
        setScannerOpen,
        error,
        setError
      }}
    >
      {children}
    </JoinClassContext.Provider>
  );
};

export const useJoinClassContext = (): JoinClassContextType => {
  const context = useContext(JoinClassContext);
  if (context === undefined) {
    throw new Error("useJoinClassContext must be used within a JoinClassProvider");
  }
  return context;
};
