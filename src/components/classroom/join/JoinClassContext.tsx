
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
  // Extract code from URL if present - normalize to uppercase and trim whitespace
  const getCodeFromURL = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code') || '';
      const normalizedCode = code.trim().toUpperCase();
      console.log("Got code from URL:", normalizedCode);
      return normalizedCode;
    } catch (e) {
      console.error("Error getting code from URL:", e);
      return '';
    }
  };
  
  const [invitationCode, setInvitationCode] = useState<string>(getCodeFromURL());
  const [loading, setLoading] = useState<boolean>(false);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update code if URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const code = getCodeFromURL();
        if (code) {
          console.log("URL changed, updating code to:", code);
          setInvitationCode(code);
        }
      } catch (e) {
        console.error("Error updating code from URL:", e);
      }
    };

    // Call immediately on mount
    handleUrlChange();
    
    // Set up listener for URL changes
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Format invitation code on change - uppercase and trim
  const handleSetInvitationCode = (code: string) => {
    // Convert to uppercase and trim whitespace
    const normalizedCode = code.trim().toUpperCase();
    setInvitationCode(normalizedCode);
  };

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
        setInvitationCode: handleSetInvitationCode,
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
