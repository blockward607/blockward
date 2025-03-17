
import { createContext, useContext, useState, ReactNode } from "react";

interface JoinClassContextType {
  invitationCode: string;
  setInvitationCode: (code: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
}

const JoinClassContext = createContext<JoinClassContextType | undefined>(undefined);

export const JoinClassProvider = ({ children }: { children: ReactNode }) => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <JoinClassContext.Provider value={{
      invitationCode,
      setInvitationCode,
      loading,
      setLoading,
      scannerOpen,
      setScannerOpen
    }}>
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
