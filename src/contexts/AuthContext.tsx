
import { createContext, useContext, ReactNode, useState } from 'react';

type UserRole = 'teacher' | 'student' | null;

interface AuthContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: any | null;
  setUser: (user: any | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const value = {
    loading,
    setLoading,
    user,
    setUser,
    userRole,
    setUserRole,
    isTeacher: userRole === 'teacher',
    isStudent: userRole === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
