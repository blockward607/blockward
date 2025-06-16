
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error);
          setIsAuthenticated(false);
          toast({
            variant: "destructive",
            title: "Authentication error",
            description: "Please sign in again",
          });
          navigate('/auth', { replace: true });
          return;
        }
        
        if (!session) {
          console.log('No active session found, redirecting to auth page');
          setIsAuthenticated(false);
          // Store the current path so we can redirect back after login
          const currentPath = location.pathname;
          if (currentPath !== '/auth' && currentPath !== '/') {
            localStorage.setItem('redirectAfterAuth', currentPath);
          }
          navigate('/auth', { replace: true });
        } else {
          console.log('Active session found, user is authenticated');
          setIsAuthenticated(true);
          
          // Check if there's a redirect path stored
          const redirectPath = localStorage.getItem('redirectAfterAuth');
          if (redirectPath && redirectPath !== location.pathname) {
            localStorage.removeItem('redirectAfterAuth');
            navigate(redirectPath, { replace: true });
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
        navigate('/auth', { replace: true });
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          localStorage.removeItem('redirectAfterAuth');
          navigate('/auth', { replace: true });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
          
          // Check for redirect path after successful sign in
          const redirectPath = localStorage.getItem('redirectAfterAuth');
          if (redirectPath) {
            localStorage.removeItem('redirectAfterAuth');
            navigate(redirectPath, { replace: true });
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, toast, location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#1A1F2C] to-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg font-medium text-gray-300">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return <>{children}</>;
};
