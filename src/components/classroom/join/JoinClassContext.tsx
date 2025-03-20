import { createContext, useContext, useState, ReactNode } from "react";

interface JoinClassContextType {
  invitationCode: string;
  setInvitationCode: (code: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  handleScanResult: (result: string) => void;
}

const JoinClassContext = createContext<JoinClassContextType | undefined>(undefined);

export const JoinClassProvider = ({ children }: { children: ReactNode }) => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScanResult = (result: string) => {
    console.log("QR scan result:", result);
    
    try {
      // If the result is a URL, extract the code parameter
      if (result.includes('?code=')) {
        const url = new URL(result);
        const codeParam = url.searchParams.get('code');
        if (codeParam) {
          setInvitationCode(codeParam.toUpperCase());
        } else {
          throw new Error("Invalid QR code. No code parameter found.");
        }
      } else {
        // Otherwise assume the result is the code itself
        setInvitationCode(result.toUpperCase());
      }
      
      // Close the scanner
      setScannerOpen(false);
    } catch (err) {
      console.error("Error processing QR code result:", err);
      setError("Invalid QR code format. Please try again.");
      setScannerOpen(false);
    }
  };

  return (
    <JoinClassContext.Provider
      value={{
        invitationCode,
        setInvitationCode,
        loading,
        setLoading,
        error,
        setError,
        scannerOpen,
        setScannerOpen,
        handleScanResult
      }}
    >
      {children}
    </JoinClassContext.Provider>
  );
};

export const useJoinClassContext = () => {
  const context = useContext(JoinClassContext);
  if (context === undefined) {
    throw new Error("useJoinClassContext must be used within a JoinClassProvider");
  }
  return context;
};
