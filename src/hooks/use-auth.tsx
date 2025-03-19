
import { useAuthContext, AuthProvider } from '@/contexts/AuthContext';
import { useAuthState } from './use-auth-state';

export function useAuth() {
  const { loading, setLoading, user, userRole, isTeacher, isStudent } = useAuthContext();
  
  // Use auth state to initialize auth state
  useAuthState();

  return { 
    loading, 
    setLoading, 
    user, 
    userRole, 
    isTeacher,
    isStudent
  };
}

// Export the provider for use in the app
export { AuthProvider };
