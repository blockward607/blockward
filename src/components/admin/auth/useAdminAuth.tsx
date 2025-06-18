
import { createContext, useContext, useState, ReactNode } from "react";

interface AdminAuthContextType {
  showError: boolean;
  errorMessage: string;
  setShowError: (show: boolean) => void;
  setErrorMessage: (message: string) => void;
  resetError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resetError = () => {
    setShowError(false);
    setErrorMessage("");
  };

  return (
    <AdminAuthContext.Provider value={{
      showError,
      errorMessage,
      setShowError,
      setErrorMessage,
      resetError
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
